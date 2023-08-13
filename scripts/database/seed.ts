import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import { imageSize } from 'image-size';
import * as path from 'path';
import prompts from 'prompts';
import { promisify } from 'util';

const sizeOf = promisify(imageSize);

const ASSETS_PATH = path.resolve('assets');
const IMAGES_PATH = path.join(ASSETS_PATH, 'images');
const METADATA_PATH = path.join(ASSETS_PATH, 'metadata');

type Metadata = {
  imageID: string;
  title: string;
  subPictures: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    tags: string[];
  }[];
}[];

const prisma = new PrismaClient();

async function main() {
  const metadataFiles = (await fs.readdir(METADATA_PATH)).filter((file) => file.endsWith('.json'));

  const metadataFile = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select a metadata file to seed database',
    choices: metadataFiles.map((file) => ({ title: file.slice(0, -5), value: file })),
  });

  const metadata = JSON.parse(
    await fs.readFile(path.join(METADATA_PATH, metadataFile.value), 'utf-8'),
  ) as Metadata;

  for (const meta of Object.values(metadata)) {
    const fileName = meta.imageID.replace(/s/g, '0');

    const url = `/images/${fileName}`;
    const fullPath = path.join(IMAGES_PATH, fileName);

    let width: number;
    let height: number;

    try {
      const result = await sizeOf(fullPath);

      if (!result || !result.width || !result.height)
        throw new Error(`Failed to get image size of ${fileName}`);

      width = result.width;
      height = result.height;
    } catch (e) {
      console.error(e);
      continue;
    }

    const imageSource = await prisma.imageSource.create({ data: { url, width, height } });
    console.log(`Created image source: ${imageSource.url}`);

    const baseImage = await prisma.image.create({
      data: {
        index: parseInt(fileName.slice(0, -4)) + 1,
        x: 0,
        y: 0,
        name: meta.title,
        width,
        height,
        source: { connect: { id: imageSource.id } },
        tags: {
          connectOrCreate: {
            where: { name: 'base' },
            create: { name: 'base' },
          },
        },
      },
    });
    console.log(`Created base image: ${baseImage.index}`);

    for (const subImage of meta.subPictures) {
      const { left, right, top, bottom, tags } = subImage;

      const image = await prisma.image.create({
        data: {
          x: Math.min(left, right),
          y: Math.min(top, bottom),
          width: Math.abs(right - left),
          height: Math.abs(bottom - top),
          parent: { connect: { id: baseImage.id } },
          source: { connect: { id: imageSource.id } },
          tags: {
            connectOrCreate: tags.map((tag) => ({ where: { name: tag }, create: { name: tag } })),
          },
        },
      });

      console.log(`Created image ${image.id}`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

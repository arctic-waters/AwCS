"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const client_1 = require("@prisma/client");
const util_1 = require("util");
const prompts_1 = __importDefault(require("prompts"));
const image_size_1 = __importDefault(require("image-size"));
const sizeOf = (0, util_1.promisify)(image_size_1.default);
const ASSETS_PATH = path.join(__dirname, '..', 'assets');
const IMAGES_PATH = path.join(ASSETS_PATH, 'images');
const METADATA_PATH = path.join(ASSETS_PATH, 'metadata');
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const metadataFiles = (yield fs.readdir(METADATA_PATH)).filter((file) => file.endsWith('.json'));
        const metadataFile = yield (0, prompts_1.default)({
            type: 'select',
            name: 'value',
            message: 'Select a metadata file to seed database',
            choices: metadataFiles.map((file) => ({ title: file.slice(0, -5), value: file })),
        });
        const metadata = JSON.parse(yield fs.readFile(path.join(METADATA_PATH, metadataFile.value), 'utf-8'));
        for (const meta of Object.values(metadata)) {
            const fileName = meta.imageID.replace(/s/g, '0');
            const url = `/images/${fileName}`;
            const fullPath = path.join(IMAGES_PATH, fileName);
            let width;
            let height;
            try {
                const result = yield sizeOf(fullPath);
                if (!result || !result.width || !result.height)
                    throw new Error(`Failed to get image size of ${fileName}`);
                width = result.width;
                height = result.height;
            }
            catch (e) {
                console.error(e);
                continue;
            }
            const imageSource = yield prisma.imageSource.create({ data: { url, width, height } });
            console.log(`Created image source: ${imageSource.url}`);
            const baseImage = yield prisma.image.create({
                data: {
                    index: parseInt(fileName.slice(0, -4)) + 1,
                    x: 0,
                    y: 0,
                    width,
                    height,
                    source: {
                        connect: { id: imageSource.id },
                    },
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
                const image = yield prisma.image.create({
                    data: {
                        x: left,
                        y: top,
                        width: right - left,
                        height: bottom - top,
                        source: {
                            connect: { id: imageSource.id },
                        },
                        tags: {
                            connectOrCreate: tags.map((tag) => ({ where: { name: tag }, create: { name: tag } })),
                        },
                    },
                });
                console.log(`Created image ${image.id}`);
            }
        }
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma.$disconnect();
    process.exit(1);
}));

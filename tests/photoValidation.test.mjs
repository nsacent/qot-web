import assert from "node:assert/strict";
import { test } from "node:test";
import { isHeifPhoto, preparePhotoForUpload } from "../lib/photoValidation.ts";

function browserDecoder(t, { width = 8064, height = 6048, fail = false, outputType = "image/jpeg" } = {}) {
    const state = { drawnSize: null, revoked: [], requestedType: null };
    const canvas = {
        width: 0,
        height: 0,
        getContext: () => ({
            fillRect() {},
            drawImage(_image, _x, _y, w, h) { state.drawnSize = [w, h]; },
        }),
        toBlob(callback, type) {
            state.requestedType = type;
            callback(new Blob([new Uint8Array([255, 216, 255])], { type: outputType }));
        },
    };
    class TestImage {
        naturalWidth = width;
        naturalHeight = height;
        set src(value) {
            if (value) queueMicrotask(() => fail ? this.onerror?.() : this.onload?.());
        }
    }
    for (const [key, value] of Object.entries({ Image: TestImage, document: { createElement: () => canvas } })) {
        const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
        Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
        t.after(() => descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key]);
    }
    t.mock.method(URL, "createObjectURL", () => "blob:iphone-photo");
    t.mock.method(URL, "revokeObjectURL", (url) => state.revoked.push(url));
    return { state, canvas };
}

test("recognizes iPhone MIME and extension variants even with missing metadata", () => {
    for (const [name, type] of [["IMG_1.HEIC", ""], ["IMG_1.HEIF", "application/octet-stream"], ["IMG_1.HIF", ""], ["photo", "image/x-heif"], ["photo", "image/heic-sequence"]]) {
        assert.equal(isHeifPhoto(new File(["photo"], name, { type })), true);
    }
});

test("leaves JPEG, PNG and WebP uploads unchanged", async () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) {
        const original = new File(["photo"], `photo.${type.split("/")[1]}`, { type });
        assert.equal(await preparePhotoForUpload(original), original);
    }
});

test("native iPhone conversion produces a bounded JPEG with correct name and MIME", async (t) => {
    const { state, canvas } = browserDecoder(t);
    const original = new File(["heif"], "IMG_1234.HEIC", { type: "image/heic", lastModified: 1234 });
    const prepared = await preparePhotoForUpload(original);
    assert.equal(prepared.type, "image/jpeg");
    assert.equal(prepared.name, "IMG_1234.jpg");
    assert.equal(prepared.lastModified, 1234);
    assert.equal(state.requestedType, "image/jpeg");
    assert.deepEqual(state.drawnSize, [2560, 1920]);
    assert.deepEqual(state.revoked, ["blob:iphone-photo"]);
    assert.deepEqual([canvas.width, canvas.height], [0, 0]);
});

test("uses decoded portrait dimensions without rotating a second time", async (t) => {
    const { state } = browserDecoder(t, { width: 3024, height: 4032 });
    await preparePhotoForUpload(new File(["heif"], "portrait.heif"));
    assert.deepEqual(state.drawnSize, [1920, 2560]);
});

test("never enlarges a smaller HEIF photo", async (t) => {
    const { state } = browserDecoder(t, { width: 800, height: 600 });
    await preparePhotoForUpload(new File(["heif"], "small.heif"));
    assert.deepEqual(state.drawnSize, [800, 600]);
});

test("retains original bytes for server decoding when browser decoders fail", async (t) => {
    const { state, canvas } = browserDecoder(t, { fail: true });
    const original = new File(["heif-original"], "photo.heif", { type: "image/heif" });
    assert.equal(await preparePhotoForUpload(original), original);
    assert.deepEqual(state.revoked, ["blob:iphone-photo"]);
    assert.deepEqual([canvas.width, canvas.height], [0, 0]);
});

test("does not mislabel PNG canvas output as JPEG", async (t) => {
    browserDecoder(t, { outputType: "image/png" });
    const original = new File(["heif-original"], "photo.heic", { type: "image/heic" });
    assert.equal(await preparePhotoForUpload(original), original);
});

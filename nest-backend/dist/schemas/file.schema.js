"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSchema = exports.File = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let File = class File {
};
exports.File = File;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], File.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 255 }),
    __metadata("design:type", String)
], File.prototype, "originalName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, trim: true, maxlength: 255 }),
    __metadata("design:type", String)
], File.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], File.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, lowercase: true }),
    __metadata("design:type", String)
], File.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, lowercase: true, maxlength: 10 }),
    __metadata("design:type", String)
], File.prototype, "fileExtension", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], File.prototype, "thumbnailPath", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], File.prototype, "isPublic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ unique: true, sparse: true, index: true }),
    __metadata("design:type", String)
], File.prototype, "shareToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], File.prototype, "shareExpiry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], File.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['aws', 'gcp', 'azure', 'local'],
        default: 'aws'
    }),
    __metadata("design:type", String)
], File.prototype, "storageProvider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], File.prototype, "storageLocation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], File.prototype, "isEncrypted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], File.prototype, "deletedAt", void 0);
exports.File = File = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], File);
exports.FileSchema = mongoose_1.SchemaFactory.createForClass(File);
exports.FileSchema.index({ userId: 1, deletedAt: 1 });
exports.FileSchema.index({ userId: 1, mimeType: 1 });
exports.FileSchema.index({ createdAt: -1 });
exports.FileSchema.index({
    originalName: 'text',
    'metadata.description': 'text',
    'metadata.tags': 'text'
});
exports.FileSchema.methods.generateShareToken = function (expiryHours = 24) {
    const crypto = require('crypto');
    this.shareToken = crypto.randomBytes(32).toString('hex');
    this.shareExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    return this.shareToken;
};
exports.FileSchema.methods.isShareTokenValid = function () {
    if (!this.shareToken)
        return false;
    if (this.shareExpiry && new Date() > this.shareExpiry)
        return false;
    return true;
};
exports.FileSchema.statics.findByUser = function (userId, options = {}) {
    const query = { userId, deletedAt: null };
    return this.find(query, null, options);
};
exports.FileSchema.statics.findPublicFiles = function (options = {}) {
    const query = { isPublic: true, deletedAt: null };
    return this.find(query, null, options);
};
//# sourceMappingURL=file.schema.js.map
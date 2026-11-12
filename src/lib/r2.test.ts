import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isR2Configured,
  getR2Client,
  resetR2Client,
  uploadToR2,
  deleteFromR2,
  extractR2Key,
  R2_STORAGE_PATHS
} from "./r2";

const mockSend = vi.fn();

vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: vi.fn().mockImplementation(() => ({
      send: mockSend
    })),
    PutObjectCommand: vi.fn().mockImplementation((input: unknown) => ({
      input,
      type: "PutObjectCommand"
    })),
    DeleteObjectCommand: vi.fn().mockImplementation((input: unknown) => ({
      input,
      type: "DeleteObjectCommand"
    }))
  };
});

describe("Cloudflare R2 Storage Integration", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    resetR2Client();
    process.env = { ...originalEnv };
    delete process.env.R2_ACCOUNT_ID;
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    delete process.env.R2_BUCKET_NAME;
    delete process.env.R2_ENDPOINT;
    delete process.env.R2_PUBLIC_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("isR2Configured", () => {
    it("returns false when environment variables are missing", () => {
      expect(isR2Configured()).toBe(false);
    });

    it("returns false when only credentials are provided without endpoint or account id", () => {
      process.env.R2_ACCESS_KEY_ID = "test-key-id";
      process.env.R2_SECRET_ACCESS_KEY = "test-secret";
      process.env.R2_BUCKET_NAME = "retzlo-storage";
      expect(isR2Configured()).toBe(false);
    });

    it("returns false when bucket name is missing", () => {
      process.env.R2_ACCESS_KEY_ID = "test-key-id";
      process.env.R2_SECRET_ACCESS_KEY = "test-secret";
      process.env.R2_ACCOUNT_ID = "test-account-id";
      expect(isR2Configured()).toBe(false);
    });

    it("returns true when account id, credentials, and bucket are provided", () => {
      process.env.R2_ACCESS_KEY_ID = "test-key-id";
      process.env.R2_SECRET_ACCESS_KEY = "test-secret";
      process.env.R2_ACCOUNT_ID = "test-account-id";
      process.env.R2_BUCKET_NAME = "retzlo-storage";
      expect(isR2Configured()).toBe(true);
    });

    it("returns true when explicit endpoint, credentials, and bucket are provided", () => {
      process.env.R2_ACCESS_KEY_ID = "test-key-id";
      process.env.R2_SECRET_ACCESS_KEY = "test-secret";
      process.env.R2_ENDPOINT = "https://custom.endpoint.com";
      process.env.R2_BUCKET_NAME = "retzlo-storage";
      expect(isR2Configured()).toBe(true);
    });
  });

  describe("getR2Client", () => {
    it("throws an error when R2 is not configured", () => {
      expect(() => getR2Client()).toThrow(
        "Cloudflare R2 is not properly configured."
      );
    });

    it("returns S3Client instance when configured and caches it", () => {
      process.env.R2_ACCESS_KEY_ID = "test-key-id";
      process.env.R2_SECRET_ACCESS_KEY = "test-secret";
      process.env.R2_ACCOUNT_ID = "test-account-id";
      process.env.R2_BUCKET_NAME = "retzlo-storage";

      const client1 = getR2Client();
      const client2 = getR2Client();
      expect(client1).toBe(client2);
    });
  });

  describe("uploadToR2", () => {
    beforeEach(() => {
      process.env.R2_ACCESS_KEY_ID = "test-key-id";
      process.env.R2_SECRET_ACCESS_KEY = "test-secret";
      process.env.R2_ACCOUNT_ID = "test-account-id";
      process.env.R2_BUCKET_NAME = "retzlo-storage";
      mockSend.mockResolvedValue({});
    });

    it("uploads buffer with PutObjectCommand and returns public url using R2_PUBLIC_URL", async () => {
      process.env.R2_PUBLIC_URL = "https://pub-retzlo.r2.dev";
      const buffer = Buffer.from("test file content");
      const url = await uploadToR2(buffer, "cards/card-1/test.txt", "text/plain");

      expect(mockSend).toHaveBeenCalledTimes(1);
      const commandArg = mockSend.mock.calls[0][0];
      expect(commandArg.input).toEqual({
        Bucket: "retzlo-storage",
        Key: "cards/card-1/test.txt",
        Body: buffer,
        ContentType: "text/plain"
      });
      expect(url).toBe("https://pub-retzlo.r2.dev/cards/card-1/test.txt");
    });

    it("strips leading slashes from key and trailing slashes from public url", async () => {
      process.env.R2_PUBLIC_URL = "https://pub-retzlo.r2.dev/";
      const buffer = Buffer.from("test file content");
      const url = await uploadToR2(buffer, "/cards/card-1/image.png");

      expect(url).toBe("https://pub-retzlo.r2.dev/cards/card-1/image.png");
    });

    it("constructs endpoint url when R2_PUBLIC_URL is not set", async () => {
      const buffer = new ArrayBuffer(8);
      const url = await uploadToR2(buffer, "uploads/item.dat");

      expect(url).toBe(
        "https://test-account-id.r2.cloudflarestorage.com/retzlo-storage/uploads/item.dat"
      );
    });
  });

  describe("deleteFromR2", () => {
    beforeEach(() => {
      process.env.R2_ACCESS_KEY_ID = "test-key-id";
      process.env.R2_SECRET_ACCESS_KEY = "test-secret";
      process.env.R2_ACCOUNT_ID = "test-account-id";
      process.env.R2_BUCKET_NAME = "retzlo-storage";
    });

    it("calls DeleteObjectCommand and returns true on success", async () => {
      mockSend.mockResolvedValue({});
      const result = await deleteFromR2("cards/card-1/test.txt");

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
      const commandArg = mockSend.mock.calls[0][0];
      expect(commandArg.input).toEqual({
        Bucket: "retzlo-storage",
        Key: "cards/card-1/test.txt"
      });
    });

    it("returns false on failure when send rejects", async () => {
      mockSend.mockRejectedValue(new Error("S3 Delete Failed"));
      const result = await deleteFromR2("cards/card-1/test.txt");

      expect(result).toBe(false);
    });
  });

  describe("extractR2Key", () => {
    it("extracts key from R2 public url", () => {
      process.env.R2_PUBLIC_URL = "https://pub-retzlo.r2.dev";
      const key = extractR2Key("https://pub-retzlo.r2.dev/chats/usr-123/1234_file.png");
      expect(key).toBe("chats/usr-123/1234_file.png");
    });

    it("extracts key from S3 endpoint url with bucket name", () => {
      process.env.R2_BUCKET_NAME = "retzlo-storage";
      const key = extractR2Key("https://account.r2.cloudflarestorage.com/retzlo-storage/chats/usr-123/1234_file.png");
      expect(key).toBe("chats/usr-123/1234_file.png");
    });
  });

  describe("R2_STORAGE_PATHS Folder Structure", () => {
    it("generates structured user avatar path", () => {
      const path = R2_STORAGE_PATHS.userAvatar("usr-123", "png");
      expect(path).toMatch(/^users\/usr-123\/avatar\/avatar_\d+\.png$/);
    });

    it("generates structured project cover path", () => {
      const path = R2_STORAGE_PATHS.projectCover("prj-456", "jpg");
      expect(path).toMatch(/^projects\/prj-456\/covers\/cover_\d+\.jpg$/);
    });

    it("generates structured card attachment path and sanitizes filename", () => {
      const path = R2_STORAGE_PATHS.cardAttachment("prj-456", "crd-789", "my document (1) #final.pdf");
      expect(path).toMatch(/^projects\/prj-456\/cards\/crd-789\/attachments\/\d+_my_document__1___final\.pdf$/);
    });

    it("generates structured diary media path", () => {
      const path = R2_STORAGE_PATHS.diaryMedia("prj-456", "dry-101", "photo.jpg");
      expect(path).toMatch(/^projects\/prj-456\/diary\/dry-101\/media\/\d+_photo\.jpg$/);
    });

    it("generates structured note attachment path", () => {
      const path = R2_STORAGE_PATHS.noteAttachment("prj-456", "not-202", "schema.png");
      expect(path).toMatch(/^projects\/prj-456\/notes\/not-202\/attachments\/\d+_schema\.png$/);
    });

    it("generates structured export report path", () => {
      const path = R2_STORAGE_PATHS.exportReport("usr-123", "financial-summary.xlsx");
      expect(path).toMatch(/^exports\/usr-123\/\d+_financial-summary\.xlsx$/);
    });

    it("generates structured chat attachment path and sanitizes filename", () => {
      const path = R2_STORAGE_PATHS.chatAttachment("usr-123", "screenshot (1).png");
      expect(path).toMatch(/^chats\/usr-123\/\d+_screenshot__1_\.png$/);
    });
  });
});

import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../../middleware/validate";
import { saveUploadedImage, type UploadFolder } from "../../lib/images";

const router = Router();

const uploadSchema = z.object({
  image: z.string().min(100, "Некорректное изображение"),
  folder: z.enum(["products", "categories", "combos"]),
});

router.post("/", validateBody(uploadSchema), (req, res) => {
  const { image, folder } = req.body as {
    image: string;
    folder: UploadFolder;
  };
  const url = saveUploadedImage(folder, image);
  if (!url) {
    res.status(400).json({
      error: "Не удалось сохранить изображение. Используйте JPG, PNG или WebP до 3 МБ",
    });
    return;
  }
  res.json({ url });
});

export default router;

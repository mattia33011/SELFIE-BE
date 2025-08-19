import * as fs from 'fs';
import * as path from 'path';
import templateRepository from '../repositories/templateRepository';

interface HtmlTemplate {
  filename: string;
  content: string;
}

class TemplateManager {
    private folderPath: string = "src/templates/"
  public initTemplate() {
    //TODO
  }

  public async initTemplateAsync(): Promise<void> {
    try {
      const folderExists = await fs.promises
        .access(this.folderPath)
        .then(() => true)
        .catch(() => false);

      if (!folderExists) {
        throw new Error(`La cartella ${this.folderPath} non esiste`);
      }

      // Legge tutti i file nella cartella
      const files = await fs.promises.readdir(this.folderPath);

      // Filtra solo i file HTML
      const htmlFiles = files.filter(
        (file) => path.extname(file).toLowerCase() === ".html"
      );

      // Legge tutti i file HTML in parallelo
      const templatePromises = htmlFiles.map(async (file) => {
        const filePath = path.join(this.folderPath, file);
        const content = await fs.promises.readFile(filePath, "utf8");
        const templateName = path.parse(file).name;

        return { filename: templateName, content };
      });

      const templates = await Promise.all(templatePromises);

      // Salva tutti i template nella mappa
      templates.forEach(({ filename, content }) => {
        templateRepository.insertIfNotExists({
            name: filename,
            content: content
        })
        console.log(`Template caricato: ${filename}`);
      });

      console.log(`Caricati ${templates.length} template HTML`);
    } catch (error) {
      console.error("Errore durante il caricamento dei template:", error);
      throw error;
    }
  }
}

const templateManager = new TemplateManager();
export default templateManager;

import { Collection } from "mongodb";
import { Repository } from "./repository";

class TemplateRepository extends Repository{

  private readonly templates: Collection;

  constructor() {
    super("templates");
    this.templates = this.collection;
    this._setup_collection();
  }

  public async insert(template: Template){
    this.templates.insertOne(template)
  }
  public async getTemplateByName(name: string): Promise<{name: string, content: string}>{
    const temp = await this.templates.findOne({name: name})
    return {
        name: temp!.name,
        content: temp!.content
    }
}

  private async _setup_collection() {
    await this.templates.createIndex({ name: 1 }, { unique: true });
  }
}
export type Template = {
    name: string,
    content: string
}

const templateRepository = new TemplateRepository()
export default templateRepository
import {Repository} from "./repository";
import {Collection, ObjectId} from "mongodb";
import {Project} from "../types/project";
import {Task} from "../types/task";

class ProjectRepository extends Repository {
    private readonly projects: Collection;
    private readonly tasks: Collection;

    constructor() {
        super("projects");
        this.projects = this.collection;
        this.tasks = this.client.collection("tasks");
        this._setupCollections();
    }
    async _setupCollections() {
        await this.projects.createIndex({ id: 1 }, { unique: true });
        await this.tasks.createIndex({ id: 1 }, { unique: false });
    }

    async saveProject(project: Project) {
        return this.projects.insertOne(project);
    }

    async findById(projectId: string) {
        return this.projects.findOne({id: projectId});
    }

    async findByUser(username: string) {
        return this.projects.find({$or:[{ author: username}, { members: username }]}).toArray();
    }

    async findByUserAndId(userId: String, projectId: string) {
        return this.projects.findOne({
            id: projectId,
            $or: [
                { members: userId },
                { author: userId }
            ]
        });
    }

    async findWithFilter(filter: Partial<Project>){
        return this.projects.find(filter).toArray();
    }

    async updateProject(project: Project) {
        return this.projects.updateOne(
            {id: project.id},
            { $set: project}
        );
    }

    async deleteProject(projectId: String) {
        return this.projects.deleteOne({id: projectId});
    }
}
const projectRepository = new ProjectRepository()
export default projectRepository

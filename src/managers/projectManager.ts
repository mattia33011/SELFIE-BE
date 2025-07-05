import userRepository from "../repositories/userRepository";

import {Project, ProjectCreateRequest} from "../types/project";
import ProjectRepository from "../repositories/projectRepository";
import {getSelfieError} from "../types/errors";
import {Task} from "../types/task";

export class ProjectManager {
    public async saveProject(userId: string, request: ProjectCreateRequest): Promise<boolean> {
        const user = await userRepository.read(userId);
        const project: Project = {
            ...request,
            id: `${user!.username}-${request.name}`,
            author: user!.username,
        };
        const result = await ProjectRepository.saveProject(project);
        return result.acknowledged;
    }

    public async deleteProject(userId: string ,projectId: string): Promise<boolean> {
        const user = await userRepository.read(userId);
        const project = await ProjectRepository.findById(projectId);
        if (project == undefined)
            throw getSelfieError("PROJECT_404", 404, "Project not found.");
        if(user!.username !== project!.author)
            throw getSelfieError("PROJECT_403", 403, "User does not have deletion privileges")
        const result = await ProjectRepository.deleteProject(projectId);
        return result.acknowledged;
    }

    public async updateProject(userId: string, request: Project): Promise<boolean> {
        const user = await userRepository.read(userId);
        const project = await ProjectRepository.findById(request.id);
        if (project == undefined)
            throw getSelfieError("PROJECT_404", 404, "Project not found.");
                
        // if(user!.username !== project!.author)
        //    throw getSelfieError("PROJECT_403", 403, "User does not have update privileges")
        const result = await ProjectRepository.updateProject(request);
        return result.acknowledged;
    }

    public async addTask(userId: string, projectId: string, task: Task): Promise<Project> {
        const user = await userRepository.read(userId);
        const project = await ProjectRepository.findByUserAndId(user!.username, projectId);
        if (project == undefined)
            throw getSelfieError("PROJECT_404", 404, "Project not found.");

        const mappedProject: Project = {
            id: project.id,
            tasks: Array.isArray(project.tasks) ? project.tasks : [],
            name: project.name,
            note: project.note,
            author: project.author,
            expire: project.expire,
            start: project.start,
            members: project.members,
        }
        console.log(mappedProject);
        mappedProject.tasks.push(task);

        const result = await ProjectRepository.updateProject(mappedProject);
        return mappedProject;
    }

    public async fetchUserProjects(userID: string): Promise<Project[]> {
        const user = await userRepository.read(userID);
            const projects = await ProjectRepository.findByUser(user!.username);
            return projects.map(it => ({
                id: it.id,
                tasks: it.tasks,
                name: it.name,
                note: it.note,
                author: it.author,
                expire: it.expire,
                start: it.start,
                members: it.members,
            }));
    }


    public async filterProjects(filter: Partial<Project>): Promise<Project[]> {
        const projects = await ProjectRepository.findWithFilter(filter);
        return projects.map(it => ({
            id: it.id,
            tasks: it.tasks,
            name: it.name,
            note: it.note,
            author: it.author,
            expire: it.expire,
            start: it.start,
            members: it.members,
        }));
    }

    public async findWithFilter(userId: string, filter: Partial<Project>): Promise<Project[]> {
        const [byAuthor, byFilter] = await Promise.all([
            this.fetchUserProjects(userId),
            this.filterProjects(filter),
        ]);
        const byFilterIds = new Set(byFilter.map(p => p.id));
        const result = byAuthor.filter(p => byFilterIds.has(p.id));
        console.log(result);
        if (result.length == 0)
            throw getSelfieError("PROJECT_404", 404, "No project matches the current filter");
        return result;
    }


}

export const projectManager = new ProjectManager();
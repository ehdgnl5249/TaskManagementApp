import { Test } from '@nestjs/testing';
import { GetTasksFilterDto } from '../dto/get-tasks-filter.dto';
import { TaskStatus } from '../dto/task-status.enum';
import { TaskRepository } from '../repository/task.repository';
import { TasksService } from './tasks.service';

const mockUser = { username: 'Test user' };

const mockTaskRepository = () => ({
  // 모의 저장소
  getTasks: jest.fn(),
  findOne: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TasksService, { provide: TaskRepository, useFactory: mockTaskRepository }],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'Some search query' };
      // call tasksService.getTasks
      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual(1);
      // expect taskRepository.getTasks To Have been called
    });
  });

  describe('getTaskById', () => {
    it('calls tasksRepository.findOne() and successfully retrieve and return the task', async () => {
      const mockTask = { title: 'Test Task', description: 'Test Task description' };
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);
    });

    it('throws an error as task is not found', () => {});
  });
});

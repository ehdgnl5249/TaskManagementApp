import { InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from 'src/domain/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksFilterDto } from '../dto/get-tasks-filter.dto';
import { TaskStatus } from '../dto/task-status.enum';
import { Task } from '../../entities/task.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository');

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');

    query.where('task.userId = :userId', { userId: user.id });
    // task.userId는 자동적으로 생성되는데 typeorm의 Entity에 userId를 따로 정의해줘야 함

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)', // 하나의 조건으로 사용하기 위해 괄호
        { search: `%${search}%` }, // 부분 단어 일치 적용
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${user.username}", DTO: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = new Task();
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user; // 추가한 user 컬럼에 대해 데이터를 넣어줌

    try {
      await task.save();
    } catch (error) {
      this.logger.error(`Failed to create a task for user "${user.username}". Data: ${createTaskDto}`, error.stack);
      throw new InternalServerErrorException();
    }
    delete task.user; // 실제 엔티티에서 삭제하는 것이 아님

    return task;
  }
}

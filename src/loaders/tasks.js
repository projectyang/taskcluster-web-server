import DataLoader from 'dataloader';
import sift from 'sift';
import ConnectionLoader from '../ConnectionLoader';
import Task from '../entities/Task';

export default ({ queue, index }) => {
  const task = new DataLoader(taskIds =>
    Promise.all(
      taskIds.map(async taskId => {
        const task = await queue.task(taskId);

        return new Task(taskId, null, task);
      })
    )
  );
  const indexedTask = new DataLoader(indexPaths =>
    Promise.all(indexPaths.map(indexPath => index.findTask(indexPath)))
  );
  const tasks = new ConnectionLoader(
    async ({ taskGroupId, options, filter }) => {
      const raw = await queue.listTaskGroup(taskGroupId, options);
      const tasks = filter ? sift(filter, raw.tasks) : raw.tasks;

      return {
        ...raw,
        tasks: tasks.map(
          ({ task, status }) => new Task(status.taskId, status, task)
        ),
      };
    }
  );

  return {
    task,
    indexedTask,
    tasks,
  };
};
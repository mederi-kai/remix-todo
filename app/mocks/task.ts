import invariant from "tiny-invariant";
import { matchSorter } from "match-sorter";
// @ts-expect-error - no types, but it's a tiny function
import sortBy from "sort-by";
import { sleep } from "~/libs/util";

export type TaskMutation = {
  id?: string;
  title?: string;
  description?: string;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  tweets?: string[];
};

export type TaskRecord = Omit<TaskMutation, "id"> & { id: string };

export const fakeTasks = {
  records: {} as Record<string, TaskRecord>,

  async getAll(): Promise<TaskRecord[]> {
    return Object.keys(fakeTasks.records).map((key) => fakeTasks.records[key]);
  },

  async get(id: string): Promise<TaskRecord | null> {
    return fakeTasks.records[id] || null;
  },

  async create(values: TaskMutation): Promise<TaskRecord> {
    const id = getNewTaskId(values);
    const createdAt = formatDate(new Date());
    const newTask = { id, createdAt, ...values };
    fakeTasks.records[id] = newTask;
    return newTask;
  },

  async set(id: string, values: TaskMutation): Promise<TaskRecord> {
    const task = await fakeTasks.get(id);
    invariant(task, `No task found for ${id}`);
    const updatedTask = {
      ...task,
      ...values,
      updatedAt: formatDate(new Date()),
    };
    fakeTasks.records[id] = updatedTask;
    return updatedTask;
  },

  delete(id: string): null {
    delete fakeTasks.records[id];
    return null;
  },
};

export async function getTasks(query?: string | null) {
  await sleep(500);
  let tasks = await fakeTasks.getAll();
  if (query) {
    tasks = matchSorter(tasks, query, {
      keys: ["title", "description"],
    });
  }
  return tasks.sort(sortBy("createdAt"));
}

export async function getTask(id: string) {
  return fakeTasks.get(id);
}

export async function createTask(newTask: TaskMutation) {
  return await fakeTasks.create(newTask);
}

export async function updateTask(id: string, updates: TaskMutation) {
  const task = await fakeTasks.get(id);
  if (!task) {
    throw new Error(`No task found for ${id}`);
  }
  await fakeTasks.set(id, { ...task, ...updates });
  return task;
}

export async function deleteTask(id: string) {
  fakeTasks.delete(id);
}

export async function updateTweet(id: string, note: string) {
  const task = await fakeTasks.get(id);
  if (!task) {
    throw new Error(`No task found for ${id}`);
  }
  await fakeTasks.set(id, {
    ...task,
    tweets: !task.tweets ? [] : [note, ...task.tweets],
  });
  return task;
}

export const getNewTaskId = (values?: TaskMutation) => {
  return values?.id ?? `task-${Math.random().toString(36).substring(2, 9)}`;
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("ja-jp", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

const sampleTasks: TaskMutation[] = [
  {
    title: "運動タスク🏋️",
    description: "スクワット100回",
    createdAt: formatDate(new Date("2023/01/11")),
    completed: true,
    tweets: ["スクワットつらい", "腹筋もやる"],
  },
  {
    title: "英語",
    description: "リスニング10問",
    createdAt: formatDate(new Date("2023/01/12")),
    completed: true,
    tweets: ["リスニングはやる"],
  },
  {
    title: "プログラミング",
    description: "Remix調査",
    createdAt: formatDate(new Date("2023/01/9")),
    completed: false,
    tweets: [],
  },
];

export const initializeTask = () => {
  sampleTasks.forEach((task) => {
    fakeTasks.create({ ...task, id: getNewTaskId() });
  });
};

initializeTask();

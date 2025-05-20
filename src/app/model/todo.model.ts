export interface Todo {
  id?: number;
  title: string;
  completed: boolean;
  priority: string;
  deadline: string;
  tags: Array<string>;
}

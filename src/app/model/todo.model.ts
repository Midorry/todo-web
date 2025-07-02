export interface Todo {
  _id?: string; // id do MongoDB tự sinh, kiểu string
  title: string;
  completed: boolean;
  priority: string;
  deadline: string;
  tags: string[];
  userId?: string; // thêm userId để biết todo này thuộc user nào
}

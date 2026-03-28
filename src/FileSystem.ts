// console.log(import.meta.glob("/public/fs/**/*"));
//
//
export class FileSystem {
  blog?: Record<string, () => Promise<{ default: string }>>;

  constructor() {
    let tree = import.meta.glob<{ default: string }>("/public/fs/**/*", {
      query: "?raw",
    });
    console.log(tree);
  }
}

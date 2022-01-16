import { Role } from "@prisma/client";
import { NextApiResponse } from "next";
import { protect } from "../../../../middleware/protect";
import { reqWithUser } from "../../../../types/reqWithUser";
import userOwnsCourse from "../../../../utils/userOwnsCourse";
const env = process.env.NODE_ENV;

function handler(req: reqWithUser, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return getTasks();
    case "POST":
      return createTask();
    default:
      return res.status(405).json({
        success: false,
        message: `Metodo ${req.method} no permitido`,
      });
  }

  // gets all tasks
  async function getTasks() {
    if (req.user.role !== Role.admin){
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      })
    }

    const tasks = await prisma.task.findMany();
    if (tasks)
      return res.status(200).json({
        success: true,
        tasks: tasks,
      });
    return res.status(404).json({
      success: false,
      message: "No se encontraron tareas",
    });
  }
  // creates an task
  async function createTask() {
  
    if (req.body) {
      if (!await userOwnsCourse(req.user.id, req.body.courseId)){
        return res.status(401).json({
          success: false,
          message: "El usuario no es dueño del curso",
        })
      }
      try {
        const task = await prisma.task.create({
          data: req.body
        });
        return res.status(200).json({
          success: true,
          task: task,
        });
      } catch (error: any) {
        return res.status(400).json({
          success: false,
          message: env === 'development' ? error.message :  "Error al crear la tarea",
        });
      }
    }
  }
}

export default protect(handler);

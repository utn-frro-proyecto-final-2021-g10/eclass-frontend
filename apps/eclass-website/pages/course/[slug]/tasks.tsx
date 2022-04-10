import type { NextPage } from "next";
import { useContext, useEffect, useState } from "react";
import { prisma } from "../../../lib/prisma";
import { CourseLayout, courseContext } from "../../../layouts/course-layout";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  Text,
} from "@chakra-ui/react";
import { Card, CardBody } from "../../../components/Card";
import { AddIcon, ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import { Course, Task } from "@prisma/client";
import { METHODS } from "http";

const Tasks: NextPage<{
  course: Course;
  tasks: Task[];
}> = ({ course, tasks }) => {
  const { setCourse } = useContext(courseContext);
  const [showForm, setShowForm] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [questions, setQuestions] = useState([0]);
  const [taskName, setTaskName] = useState("");


  useEffect(() => {
    setCourse(course);
  }, []);

  return (
    <GridItem colSpan={12}>
      <Grid justify="center" width="100%" height="auto">
        <Card>
          <CardBody width="100%">
            <HStack align="center" justify="space-between">
              <HStack>
                <Avatar size="sm" />
                <Text fontSize="sm">Create a task!</Text>
              </HStack>
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </Button>
            </HStack>

            {showForm && (
              <>
                <Divider />
                <Grid
                  paddingTop="1.2em"
                  templateColumns="repeat(5, 1fr)"
                  width="80%"
                  gap={4}
                >
                  <GridItem colSpan={1} alignSelf="end" justifySelf="end">
                    <FormLabel>Name</FormLabel>
                  </GridItem>
                  <GridItem colSpan={4}>
                    <Input
                      width="100%"
                      placeholder="Task name"
                      id="taskName"
                      value={taskName}
                    />
                  </GridItem>
                  <GridItem colSpan={1} alignSelf="end" justifySelf="end">
                    <FormLabel>Description</FormLabel>
                  </GridItem>
                  <GridItem colSpan={4}>
                    <Input
                      width="100%"
                      placeholder="Task description"
                      id="taskDescription"
                    />
                  </GridItem>
                  {/* TODO: Poner un datetimepicker */}
                  <GridItem colSpan={1} alignSelf="end" justifySelf="end">
                    <FormLabel>Start Date</FormLabel>
                  </GridItem>
                  <GridItem colSpan={4}>
                    <Input width="100%" placeholder="dd/MM/yyyy hh:mm" />
                  </GridItem>
                  <GridItem colSpan={1} alignSelf="end" justifySelf="end">
                    <FormLabel>End Date</FormLabel>
                  </GridItem>
                  <GridItem colSpan={4}>
                    <Input width="100%" placeholder="dd/MM/yyyy hh:mm" />
                  </GridItem>
                  <GridItem colSpan={4} colStart={2}>
                    <Box boxShadow="xs" p="6" rounded="md" bg="white">
                      <Text fontWeight="bold" fontSize="1.2rem">
                        Add your questions here:{" "}
                      </Text>
                      {/* <GridContainer > */}
                      {questions.length > 0 &&
                        questions[0] !== 0 &&
                        questions.map((question, i) => (
                          <>
                            <GridItem key={i} paddingTop="0.5rem">
                              <FormLabel>Question {question}</FormLabel>
                            </GridItem>
                            <GridItem key={i + 1}>
                              <Input placeholder="Question" />
                            </GridItem>
                            <GridItem key={i + 2} paddingTop="0.5rem">
                              <FormLabel>
                                Answer to question {question}
                              </FormLabel>
                            </GridItem>
                            <GridItem key={i + 3}>
                              <Input placeholder="Answer to question(optional)" />
                            </GridItem>
                          </>
                        ))}
                      {/* </GridContainer> */}
                    </Box>
                  </GridItem>
                  <GridItem colSpan={1} colStart={2} justifySelf="start">
                    <Button
                      onClick={() => {
                        setQuestionNumber(questionNumber + 1);
                        if (questions.length === 1 && questions[0] === 0)
                          setQuestions([1]);
                        else setQuestions(questions.concat([questionNumber]));
                      }}
                    >
                      <AddIcon />
                    </Button>
                  </GridItem>

                  <GridItem colSpan={5} justifySelf="end">
                    <Button width="100%">Submit</Button>
                  </GridItem>
                </Grid>
              </>
            )}
          </CardBody>
        </Card>
      </Grid>
      <Flex>
        {tasks ? (
          <Text> No hay tareas en el curso</Text>
        ) : (
          <Text> Tareas {tasks} </Text>
        )}
      </Flex>
    </GridItem>
  );
};

// @ts-ignore
Tasks.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export const getServerSideProps = async (context: any) => {
  // TODD: check if the user belongs to the course

  const course = await prisma.course.findUnique({
    where: {
      slug: context.params.slug,
    }
  });
  // If course is null return empty
  if (!course) {
    return { props: {} };
  }

  const fetchCourseTasks = async (): Promise<Task[]> => {
    const response = await fetch(
      `/api/v1/course/${course.id}/tasks`,
      {
        method: "GET",
      }
    );
    const tasks = await response.json();
    return tasks;
  };
  const tasks = await fetchCourseTasks();

  return {
    props: { course, tasks },
  };
};

export default Tasks;

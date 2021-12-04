import React from "react";
import Box from "@mui/material/Box";
import { StyledEngineProvider } from "@mui/material/styles";
import "./styles.css";
import { Typography, Button, Checkbox } from "@mui/material";
import Metamask from "../metamask.png";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { injected } from "../connector/injected";
import { useEagerConnect, useInactiveListener } from "./hook";
import Web3 from "web3";

const ToDoJSON = require("../abis/ToDo.json");

export default function Home() {
  const { active, account, library, connector, activate, deactivate } =
    useWeb3React();
  const [tasks, setTasks] = React.useState<{ task: string; isDone: boolean }[]>(
    []
  );

  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager);

  const getTasks = async () => {
    console.log("GT TASKS");
    const web3: Web3 = library;
    const nwId = await web3.eth.net.getId();
    console.log("NW ID : ", nwId);
    const contractData = ToDoJSON.networks[nwId];
    if (contractData) {
      const contract = new web3.eth.Contract(
        ToDoJSON.abi,
        contractData.address
      );
      //   const tasks = await contract.methods.getTasks().call();
      //   console.log("TAsks : ", tasks);
      //   return tasks;
      const tasksLength = await contract.methods
        .getTaskCount()
        .call({ from: account });
      console.log(tasksLength);
      const tasks: { task: string; isDone: boolean }[] = [];
      for (let i = 0; i < tasksLength; i++) {
        const task = await contract.methods.getTask(i).call();
        console.log("TASK : ", task);
        if (task[0]) {
          tasks.push({ task: task[0], isDone: task[1] });
        }
      }
      return tasks;
    }
    return [];
  };

  const createTask = async (task: string) => {
    if (!library) return;
    console.log("Task create");
    const web3: Web3 = library;
    const nwId = await web3.eth.net.getId();
    const contractData = ToDoJSON.networks[nwId];
    if (contractData) {
      const contract = new web3.eth.Contract(
        ToDoJSON.abi,
        contractData.address
      );
      const response = await contract.methods
        .createTask(task)
        .send({ from: account });
      console.log("RESONSE CREATE : ", response);
      return response;
    }
    return false;
  };

  const updateTask = async (idx: number, status: boolean) => {
    if (!library) return;
    console.log("Task create");
    const web3: Web3 = library;
    const nwId = await web3.eth.net.getId();
    const contractData = ToDoJSON.networks[nwId];
    if (contractData) {
      const contract = new web3.eth.Contract(
        ToDoJSON.abi,
        contractData.address
      );
      const response = await contract.methods
        .updateTask(idx, status)
        .send({ from: account });
      console.log("RESONSE CREATE : ", response);
      if (response) {
        const uTasks = [...tasks];
        uTasks[idx].isDone = status;
        setTasks(uTasks);
      }
    }
    return;
  };

  React.useEffect(() => {
    if (active && library) {
      getTasks().then((res) => {
        setTasks(res);
      });
    }
  }, [active]);

  const connect = async () => {
    console.log("CONNECT");
    try {
      await activate(injected);
      console.log("CONNECTED");
    } catch (error) {}
  };

  const disconnect = async () => {
    try {
      await deactivate();
    } catch (error) {}
  };

  return (
    <StyledEngineProvider injectFirst>
      <div className="root">
        <Box
          component="div"
          sx={{
            height: "50%",
            width: "50%",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "#fafafa",
          }}
        >
          <div className="header">
            {active ? (
              <Typography
                style={{ color: "rgb(69, 148, 45)", fontWeight: "bold" }}
              >
                Connected
              </Typography>
            ) : (
              <Typography style={{ color: "red", fontWeight: "bold" }}>
                Disconnected
              </Typography>
            )}
            <div className="button" onClick={() => connect().then(() => {})}>
              <img
                src={Metamask}
                style={{ height: 24, width: 24, marginRight: 10 }}
              />
              <Typography style={{ fontWeight: "bold" }}>
                Connect to metamask
              </Typography>
            </div>
          </div>
          <div>
            {account ? (
              <Typography style={{ fontSize: 10 }}>{account}</Typography>
            ) : null}
          </div>
          {tasks.map((task, idx) => (
            <div
              style={{
                width: "100%",
                marginTop: 8,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Checkbox
                checked={task.isDone}
                onChange={async () => {
                  await updateTask(idx, !task.isDone);
                }}
              />
              <Typography style={{ fontSize: 16 }} variant="overline">
                {task.task}
              </Typography>
            </div>
          ))}
          <Button
            onClick={() => {
              createTask("new task").then();
            }}
          >
            add task
          </Button>
        </Box>
      </div>
    </StyledEngineProvider>
  );
}

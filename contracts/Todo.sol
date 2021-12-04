pragma solidity ^0.8.0;

contract ToDo {
    struct Task {
        string task;
        bool isDone;
    }

    mapping(address => Task[]) private tasks;

    function createTask(string calldata _task) external returns (bool) {
        tasks[msg.sender].push(Task({task: _task, isDone: false}));
        return true;
    }

    function getTasks() external view returns (Task[] memory) {
        return tasks[msg.sender];
    }

    function getTask(uint256 _taskIndex) external view returns (Task memory) {
        // Task storage task = tasks[msg.sender][_taskIndex];
        // return task;
        return tasks[msg.sender][_taskIndex];
    }

    function updateTask(uint256 _taskIndex, bool status)
        external
        returns (bool)
    {
        tasks[msg.sender][_taskIndex].isDone = status;
        return true;
    }

    function getTaskCount() public view returns (uint256) {
        return tasks[msg.sender].length;
    }
}

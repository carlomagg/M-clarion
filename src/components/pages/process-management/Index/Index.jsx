import React, { useEffect, useState } from "react";
import PageTitle from "../../../partials/PageTitle/PageTitle";
import PageHeader from "../../../partials/PageHeader/PageHeader";
import LinkButton from "../../../partials/buttons/LinkButton/LinkButton";
import PlusIcon from "../../../../assets/icons/plus.svg";
import importIcon from "../../../../assets/icons/import.svg";
import exportIcon from "../../../../assets/icons/export.svg";
import CreateNewProcess from "../ProcessManagement/components/CreateNewProcess";
import searchIcon from "../../../../assets/icons/search.svg";
import { Field } from "../../../partials/Elements/Elements";
import SelectDropdown from "../../../partials/dropdowns/SelectDropdown/SelectDropdown";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import ProcessQueue from "../ProcessManagement/components/ProcessQueue";
import { useDispatch, useSelector } from "react-redux";
import ProcessAssignment from "../ProcessManagement/components/ProcessAssignment";
import { toggleShowAssignedProcess } from "../../../../config/slices/globalSlice";
import { useQuery } from "@tanstack/react-query";
import ProcessService from "../../../../services/Process.service";
import ImportTab from "../ProcessManagement/components/ImportTab";

const Index = () => {
  const [showItemForm, setShowItemForm] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [processes, setProcesses] = useState([]);
  const [showImportTab, setShowImportTab] = useState("");

  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const { showAssignedProcess } = useSelector((state) => state.global);

  useEffect(() => {
    console.log(processes);
  }, [processes]);

  useEffect(() => {
    console.log("Process", showAssignedProcess);
  }, [showAssignedProcess]);

  const [showMenu, setShowMenu] = useState({
    status: false,
    index: 0,
  });
  const dispatch = useDispatch();

  const handleMenu = (index) => {
    setShowMenu({ status: !showMenu.status, index: index });
  };

  const createNewProcess = () => {
    setShowItemForm(true);
  };
  const importTab = () => {
    setShowImportTab(true);
  };

  const categories = [
    { id: 1, text: "Category 1" },
    { id: 2, text: "Category 2" },
    { id: 3, text: "Category 3" },
    { id: 4, text: "Category 4" },
  ];

  const classes = [
    { id: 1, text: "Class 1" },
    { id: 2, text: "Class 2" },
    { id: 3, text: "Class 3" },
    { id: 4, text: "Class 4" },
  ];

  // Helper functions to set color based on priority and status
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-yellow-100 text-yellow-800";
      case "Medium":
        return "bg-blue-100 text-blue-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500 text-green-800";
      case "Draft":
        return "bg-gray-200 text-gray-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  // const handleDelete = (processId) => {
  //   const updatedProcesses = processDataLog["Processes"].filter(
  //     (process) => process.id !== processId
  //   );

  //   setProcesses(updatedProcesses);
  // };
  const handleDelete = (processId) => {
    const updatedProcesses = processes.filter(
      (process) => process.id !== processId
    );
    setProcesses(updatedProcesses);
  };

  const {
    isLoading,
    data: processDataLog,
    error,
    refetch,
  } = useQuery({
    queryKey: ["processeslog"],
    queryFn: () => ProcessService.getProcessLog(),
  });
  console.log("processlog", processDataLog);
  const MenuDot = ({ process, onDelete }) => (
    <div className="absolute  top-0 right-[5px] w-[120px]  items-center  bg-white border shadow-md cursor-pointer border-[#676767] text-black flex rounded-lg ">
      <ul>
        <li
          onClick={() =>
            dispatch(
              toggleShowAssignedProcess({
                type: process.processType,
                title: process.title,
              })
            )
          }
          className="px-2 hover:bg-gray-100"
        >
          Assign process
        </li>
        <li className="px-2 hover:bg-gray-100">Edit Process</li>
        <li
          onClick={() => onDelete(process.id)}
          className="px-2 hover:bg-gray-100"
        >
          Delete
        </li>
        <li className="px-2 hover:bg-gray-100">Suspend</li>
      </ul>
    </div>
  );

  return (
    <>
      <div className={` ${!showImportTab ? "flex" : "hidden"}`}>
        <div
          className={`p-10 pt-4 w-full flex flex-col gap-6 ${
            !showAssignedProcess ? "flex" : "hidden"
          }`}
        >
          <PageTitle title={"Process Management"} />
          <PageHeader>
            <div className="flex gap-3 items-center">
              <>
                <LinkButton
                  text={"Import"}
                  icon={importIcon}
                  onClick={importTab}
                />
                <LinkButton text={"Export"} icon={exportIcon} />
              </>

              <LinkButton
                text={"Create new process"}
                icon={PlusIcon}
                onClick={createNewProcess}
                // onClick={ => {}}
              />
            </div>
          </PageHeader>
          <div
            className={`mt-4 p-6 flex flex-col gap-6 bg-white rounded-lg border border-[#CCC] ${
              !showItemForm ? "flex" : "hidden"
            }`}
          >
            {/* <div className="mt-4 p-6 flex flex-col gap-6 bg-white rounded-lg border border-[#CCC]"> */}
            <h2>Process</h2>

            {/* Search and Filter Controls */}
            <div className=" flex  items-center  gap-4 mb-6">
              {/* Search Box */}
              <div className="w-full relative">
                <input
                  type="text"
                  placeholder="Search Incidence using ID, Name, Category"
                  className="w-full p-3 pl-10 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                  // value={searchTerm}
                  // onChange={(e) => setSearchTerm(e.target.value)}
                />

                <img
                  src={searchIcon}
                  className="absolute left-3 top-3 text-gray-400"
                />
              </div>
              {/* <div className="p-3 text-sm ">
            <Field
              {...{ name: "start_date", label: "Date Created", type: "date" }}
            />
          </div>
          <div className="p-3 text-sm  ">
            <PriorityDropdown categories={categories} />
          </div>
          <div className=" p-3 text-sm ">
            <StatusDropdown classes={classes} />
          </div> */}
              <div className="flex gap-4 ">
                <select
                  className=" p-3 text-sm border-b border-border-gray last:border-none"
                  // value={selectedDate}
                  // onChange={(e) => setSelectedDate(e.target.value)}
                >
                  <option value="">Date Created</option>
                  <option value="2024-11-01">2024-11-01</option>
                  <option value="2024-11-02">2024-11-02</option>
                  <option value="2024-11-03">2024-11-03</option>
                  <option value="2024-11-04">2024-11-04</option>
                  {/* Add more dates as needed */}
                </select>

                {/* Priority Dropdown */}
                {/* <select
                className="p-3 text-sm border-b border-border-gray last:border-none  "
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option
                  value=""
                  className="p-3 border-b border-border-gray last:border-none hover:bg-gray-200 text-sm"
                >
                  Priority
                </option>
                <option
                  className="p-3 border-b border-border-gray last:border-none hover:bg-gray-200 text-sm"
                  value="Critical"
                >
                  Critical
                </option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select> */}

                {/* Status Dropdown */}
                <select
                  className="p-3 text-sm border-b border-border-gray "
                  // value={selectedStatus}
                  // onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="relative overflow-x-auto ">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase border-b  last:border-none">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      ID
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Title
                    </th>

                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>

                    <th scope="col" className="px-4 py-3">
                      type
                    </th>
                    <th scope="col" className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {processDataLog &&
                    processDataLog["Processes"]?.map((process, index) => (
                      <tr key={index} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-4 font-medium text-pink-500">
                          {process.id}
                        </td>
                        <td className="px-4 py-4 text-gray-900">
                          {process.name}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                              process.status
                            )}`}
                          >
                            {process.status}
                          </span>
                        </td>
                        {/* <td className="px-4 py-4">{process.dateCreated}</td> */}
                        <td className="px-3 py-3">{process.type}</td>
                        <td className=" text-right">
                          <PiDotsThreeVerticalBold
                            className="cursor-pointer  text-black"
                            onClick={() => handleMenu(index)}
                          />
                          {showMenu &&
                            showMenu.status &&
                            showMenu.index == index && (
                              <MenuDot
                                index={index}
                                process={process}
                                onDelete={handleDelete}
                              />
                            )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            {showItemForm && (
              <CreateNewProcess
                setProcesses={setProcesses}
                setShowItemForm={setShowItemForm}
              />
            )}
          </div>
        </div>
        <div className={`${!showItemForm ? "flex" : "hidden"}`}>
          {/* <ProcessAssignment /> */}
          {showAssignedProcess && <ProcessAssignment />}
        </div>
      </div>
      <div>{showImportTab && <ImportTab />}</div>
    </>
  );
};

// function PriorityDropdown({ categories, selected, onChange }) {
//   const [isCollapsed, setIsCollapsed] = useState(true);
//   return (
//     <SelectDropdown
//       label={"Priority"}
//       placeholder={""}
//       items={categories}
//       name={"class"}
//       selected={selected}
//       onSelect={onChange}
//       isCollapsed={isCollapsed}
//       onToggleCollpase={setIsCollapsed}
//     />
//   );
// }

// function StatusDropdown({ classes, selected, onChange }) {
//   const [isCollapsed, setIsCollapsed] = useState(true);
//   return (
//     <SelectDropdown
//       label={"Status"}
//       placeholder={""}
//       items={classes}
//       name={"class"}
//       selected={selected}
//       onSelect={onChange}
//       isCollapsed={isCollapsed}
//       onToggleCollpase={setIsCollapsed}
//     />
//   );
// }

export default Index;

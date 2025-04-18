import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../partials/PageTitle/PageTitle";
import PageHeader from "../../../partials/PageHeader/PageHeader";
import LinkButton from "../../../partials/buttons/LinkButton/LinkButton";
import PlusIcon from "../../../../assets/icons/plus.svg";
import importIcon from "../../../../assets/icons/import.svg";
import exportIcon from "../../../../assets/icons/export.svg";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
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
import { useMessage } from "../../../../contexts/MessageContext";

const Index = () => {
  const [showItemForm, setShowItemForm] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [processes, setProcesses] = useState([]);
  const [showImportTab, setShowImportTab] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      case "ACTIVE":
        return "bg-green-500 text-white";
      case "DRAFT":
        return "bg-gray-200 text-gray-800";
      case "PENDING":
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [processToDelete, setProcessToDelete] = useState(null);

  const handleDeleteClick = (processId) => {
    console.log("Deleting process with ID:", processId);
    setProcessToDelete(processId);
    setShowDeleteConfirm(true);
  };

  const { dispatchMessage } = useMessage();

  const handleDeleteConfirm = async () => {
    if (processToDelete) {
      try {
        await ProcessService.deleteProcess(processToDelete);
        refetch();
        setShowDeleteConfirm(false);
        setProcessToDelete(null);
        dispatchMessage('success', 'Process deleted successfully');
      } catch (error) {
        console.error("Error deleting process:", error);
        let errorMessage = 'Failed to delete process. ';
        if (error.response?.data?.message) {
          errorMessage += error.response.data.message;
        }
        dispatchMessage('error', errorMessage);
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setProcessToDelete(null);
  };

  const [processToEdit, setProcessToEdit] = useState(null);

  const handleEdit = (process) => {
    console.log("Opening edit form for process:", process);
    setProcessToEdit(process);
    setShowItemForm(true);
  };

  const handleAssignProcess = (process) => {
    console.log("Assigning process:", process);
    dispatch(
      toggleShowAssignedProcess({
        type: process.type,
        title: process.name,
        id: process.id
      })
    );
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

  // Pagination logic
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const navigate = useNavigate();

  const MenuDot = ({ process }) => (
    <div className="absolute top-[100%] right-0 w-[120px] bg-white border shadow-md cursor-pointer border-[#676767] text-black rounded-lg z-10">
      <ul className="w-full">
        <li
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/process-management/${process.id}/view`);
          }}
          className="w-full px-3 py-1.5 hover:bg-gray-100 text-left"
        >
          View Details
        </li>
        <li
          onClick={(e) => {
            e.stopPropagation();
            handleAssignProcess(process);
          }}
          className="w-full px-3 py-1.5 hover:bg-gray-100 text-left"
        >
          Assign process
        </li>
        <li 
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(process);
          }}
          className="w-full px-3 py-1.5 hover:bg-gray-100 text-left"
        >
          Edit Process
        </li>
        <li
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(process.id);
          }}
          className="w-full px-3 py-1.5 hover:bg-gray-100 text-left"
        >
          Delete
        </li>
      </ul>
    </div>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading processes</div>;
  }

  const allProcesses = processDataLog?.Processes || [];
  const totalPages = Math.ceil(allProcesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProcesses = allProcesses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this process?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
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
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase border-b last:border-none">
                  <tr>
                    <th scope="col" className="px-4 py-3">ID</th>
                    <th scope="col" className="px-4 py-3">Title</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Type</th>
                    <th scope="col" className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProcesses.map((process, index) => (
                    <tr 
                      key={process.id || index} 
                      className="bg-white hover:bg-opacity-80"
                    >
                      <td className="px-4 py-4 font-medium text-pink-500">
                        {process.id}
                      </td>
                      <td className="px-4 py-4 text-gray-900">{process.name}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                            process.status
                          )}`}
                        >
                          {process.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">{process.type}</td>
                      <td className="text-right relative">
                        <PiDotsThreeVerticalBold
                          className="cursor-pointer text-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenu(index);
                          }}
                        />
                        {showMenu &&
                          showMenu.status &&
                          showMenu.index === index && (
                            <MenuDot
                              process={process}
                            />
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {allProcesses.length > itemsPerPage && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex justify-between w-full">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(startIndex + itemsPerPage, allProcesses.length)}
                      </span> of{' '}
                      <span className="font-medium">{allProcesses.length}</span> results
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-3 py-2 rounded-md ${
                          currentPage === 1
                            ? 'bg-pink-100 text-pink-300 cursor-not-allowed'
                            : 'bg-[#E91E63] text-white hover:bg-pink-700'
                        } transition-colors duration-200`}
                      >
                        <ChevronLeftIcon className="w-5 h-5 mr-2" />
                        <span>Previous</span>
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-3 py-2 rounded-md ${
                          currentPage === totalPages
                            ? 'bg-pink-100 text-pink-300 cursor-not-allowed'
                            : 'bg-[#E91E63] text-white hover:bg-pink-700'
                        } transition-colors duration-200`}
                      >
                        <span className="mr-2">Next</span>
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            {showItemForm && (
              <CreateNewProcess
                setProcesses={setProcesses}
                setShowItemForm={setShowItemForm}
                editProcess={processToEdit}
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

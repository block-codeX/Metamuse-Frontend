"use client"
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "zustand";
import axios from "axios";
import { api } from "@/lib/utils";
import { create } from "zustand";
import { toast } from "sonner";

// Define Zustand store correctly
interface UserStore {
  users: { id: string; name: string }[];
  setUsers: (users: { id: string; name: string }[]) => void;
}

const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}));


// Async functions to fetch and add users
const fetchUsers = async (projectId: string, query = "") => {
  try {
    let url = '/users/all'
    if (query.trim()) url +=`?name=${query}`
    const response = await api().get(url);
    if (response.status === 200) {
      const { docs } = response.data;
      return docs; // Assume it returns an array of users
    }
    return []
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

const addUserToProject = async (projectId: string, email: string) => {
  console.log("Adding user to project", projectId, email);
  try {
    const response = await api(true).post(`/projects/${projectId}/invite`, { email });
    if (response.status === 201) {
      return `Invite token sent to ${email} successfully, or send ${response.data.token}`;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export default function AddUserModal({ projectId, isOpen, onClose }: { projectId: string; isOpen: boolean; onClose: () => void }) {
  const { users, setUsers } = useUserStore(); // ✅ Correct Zustand usage
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUsers(projectId).then(setUsers);
    }
  }, [isOpen, projectId]);

  const handleSearch = async (e: any) => {
    const query = e.target.value;
    setSearch(query);
    const results = await fetchUsers(projectId, query);
    setUsers(results);
  };

  const handleAddUser = async (userId: string) => {
    const token = await addUserToProject(projectId, userId);
    onClose();
    console.log("Invite token:", token);
    toast(token);

  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Users</DialogTitle>
        </DialogHeader>
        <Input 
          placeholder="Search users..." 
          value={search} 
          onChange={handleSearch} 
          className="mb-2"
        />
        <ScrollArea className="max-h-60 border rounded-md p-2">
          {users.map((user) => (
            <Button 
              key={user._id} 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => handleAddUser(user.email)}
            >
              {user.firstName} { user.lastName }
              <span className="text-xs text-gray-500 ml-2">{user.email}</span>
            </Button>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

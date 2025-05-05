import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/pulse-loader";
import { api, getColorsFromId, getInitials, humanizeDate } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface Collaborator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Message {
  id: string;
  sender: Collaborator;
  content: string;
  createdAt: string;
  updatedAt: string;
}
// Message component
export const MessageItem = ({
  message,
  sender,
}: {
  message: Message;
  sender: Collaborator;
}) => {
  const colors = getColorsFromId(sender._id);
  return (
    <div className="flex items-start space-x-3 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback
          className="bg-primary text-primary-foreground text-xs"
          style={{
            backgroundColor: colors.background,
            color: colors.text,
          }}
        >
          {getInitials(sender.firstName, sender.lastName)}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium">
            {sender.firstName} {sender.lastName}
          </p>
          <span className="text-xs text-muted-foreground">
            {humanizeDate(message.createdAt)}
          </span>
        </div>
        <p className="text-sm mt-1">{message.content}</p>
      </div>
    </div>
  );
};

export const CollaboratorItem = ({ collaborator }: { collaborator: Collaborator }) => {
  return (
    <div className="flex items-center space-x-3 mb-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
          {getInitials(collaborator.firstName, collaborator.lastName)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">
          {collaborator.firstName} {collaborator.lastName}
        </p>
        <p className="text-xs text-muted-foreground">{collaborator.email}</p>
      </div>
    </div>
  );
};
export const PendingCollaboratorItem = ({ collaborator, setReload, projectId }: { collaborator: Collaborator, setReload: any, projectId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const cancelCollaborator = async () => {
    setIsLoading(true);
    try {
      const response = await api(true).post(`/projects/${projectId}/invites/cancel`, {
        email: collaborator.email,
      } )
      if (response.status === 200) {
        toast.success(`Invite revoked successfully for ${collaborator.firstName} ${collaborator.lastName}`);
      }
    } catch (error) {
      console.error("Error cancelling collaborator:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setReload(true);
    }
  }
  return (
    <div className="flex items-center space-x-3 mb-2 onClick cursor-pointer opacity-50 py-2 px-1 rounded-md">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
          {getInitials(collaborator.firstName, collaborator.lastName)}
        </AvatarFallback>
      </Avatar>
      <div className="grow flex-col items-start justify-between w-full overflow-hidden  "> 
        <p className="font-medium text-sm flex flex-row items-center justify-between w-full">
          {collaborator.firstName} {collaborator.lastName}
          {isLoading ? <Spinner/>: <X onClick={cancelCollaborator} strokeWidth={1.5} size={18} className="active:scale-95 transition-all transition-200"/>}
        </p>
        <p className="text-xs text-muted-foreground">{collaborator.email}</p>
      </div>
    </div>
  );
};
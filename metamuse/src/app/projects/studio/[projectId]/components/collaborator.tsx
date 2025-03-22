import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, getRandomComplementaryColors, humanizeDate } from "@/lib/utils";

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
  const colors = getRandomComplementaryColors();
  return (
    <div className="flex items-start space-x-3 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarFallback
          className="bg-primary text-primary-foreground text-xs"
          style={{
            backgroundColor: colors[0].background,
            color: colors[0].text,
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
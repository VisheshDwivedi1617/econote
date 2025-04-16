
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  Share,
  Globe,
  Users,
  Lock,
  Mail,
  Link as LinkIcon,
  Loader2,
  Check,
  X,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Permission = "view" | "edit" | "comment";
type Visibility = "private" | "shared" | "public";

interface Collaborator {
  email: string;
  permission: Permission;
}

interface NoteSharingProps {
  noteId: string;
  noteTitle: string;
}

const NoteSharing = ({ noteId, noteTitle }: NoteSharingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [emailInput, setEmailInput] = useState("");
  const [permission, setPermission] = useState<Permission>("view");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  
  const { toast } = useToast();
  
  const shareUrl = `${window.location.origin}/shared-note/${noteId}`;
  
  const handleAddCollaborator = () => {
    if (!emailInput || !emailInput.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Check if collaborator already exists
    if (collaborators.some(c => c.email === emailInput)) {
      toast({
        title: "Collaborator already added",
        description: "This email is already in the collaborators list",
        variant: "destructive",
      });
      return;
    }
    
    setCollaborators([...collaborators, {
      email: emailInput,
      permission
    }]);
    
    setEmailInput("");
    
    toast({
      title: "Collaborator added",
      description: `${emailInput} can now ${permission} this note`,
    });
  };
  
  const handleRemoveCollaborator = (email: string) => {
    setCollaborators(collaborators.filter(c => c.email !== email));
    
    toast({
      title: "Collaborator removed",
      description: `${email} no longer has access to this note`,
    });
  };
  
  const handlePermissionChange = (email: string, newPermission: Permission) => {
    setCollaborators(collaborators.map(c => 
      c.email === email ? { ...c, permission: newPermission } : c
    ));
  };
  
  const handleVisibilityChange = (newVisibility: Visibility) => {
    setVisibility(newVisibility);
    
    const messages = {
      private: "Note is now private and only accessible to you",
      shared: "Note is now shared only with specific people",
      public: "Note is now publicly accessible to anyone with the link"
    };
    
    toast({
      title: "Visibility changed",
      description: messages[newVisibility],
    });
  };
  
  const handleShareNote = async () => {
    setIsSharing(true);
    
    // This would be implemented with a backend API call
    // For now we'll simulate the API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Note shared successfully",
      description: visibility === "public" 
        ? "Anyone with the link can now access this note" 
        : `Note shared with ${collaborators.length} collaborator${collaborators.length !== 1 ? 's' : ''}`,
    });
    
    setIsSharing(false);
    setIsOpen(false);
  };
  
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard",
      });
      
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Failed to copy link",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Share className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
          <DialogDescription>
            Share "{noteTitle}" with others or make it public
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Note visibility</Label>
            <Select 
              value={visibility} 
              onValueChange={(value) => handleVisibilityChange(value as Visibility)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span>Private - Only you</span>
                  </div>
                </SelectItem>
                <SelectItem value="shared">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Shared - Specific people</span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Public - Anyone with the link</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(visibility === "shared" || visibility === "public") && (
            <div className="flex items-center space-x-2">
              <Switch 
                id="allow-comments"
                checked={allowComments}
                onCheckedChange={setAllowComments}
              />
              <Label htmlFor="allow-comments">Allow comments</Label>
            </div>
          )}
          
          {visibility === "shared" && (
            <div className="space-y-2">
              <Label>Add people</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1"
                />
                <Select value={permission} onValueChange={(v) => setPermission(v as Permission)}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddCollaborator}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {visibility === "shared" && collaborators.length > 0 && (
            <div className="space-y-2">
              <Label>Collaborators</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {collaborators.map((collab) => (
                  <div key={collab.email} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{collab.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            {collab.permission === "view" && "Can view"}
                            {collab.permission === "comment" && "Can comment"}
                            {collab.permission === "edit" && "Can edit"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change permission</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handlePermissionChange(collab.email, "view")}>
                            Can view
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePermissionChange(collab.email, "comment")}>
                            Can comment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePermissionChange(collab.email, "edit")}>
                            Can edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveCollaborator(collab.email)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(visibility === "shared" || visibility === "public") && (
            <div className="space-y-2">
              <Label>Share link</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center border rounded-md px-3 py-2 bg-muted text-sm">
                  <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate">{shareUrl}</span>
                </div>
                <Button variant="secondary" size="icon" onClick={copyShareLink}>
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleShareNote} 
            disabled={isSharing || (visibility === "shared" && collaborators.length === 0)}
          >
            {isSharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              "Confirm & Share"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteSharing;

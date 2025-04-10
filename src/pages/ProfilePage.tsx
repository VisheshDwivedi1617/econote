
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { 
  User, Mail, Phone, MapPin, Calendar, BookOpen, 
  Edit, Save, Upload, LogOut, Check, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfilePage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "I'm a student who loves taking notes and organizing my thoughts. EcoNote helps me capture my ideas and study efficiently.",
    joinDate: "January 2024",
    profession: "Student",
    website: "johndoe.com",
    usageStats: {
      notesCreated: 45,
      totalPages: 120,
      lastActive: "Today",
      storageUsed: "23 MB"
    },
    preferences: {
      theme: "system",
      language: "English",
      notificationEnabled: true,
      autoSaveInterval: 5
    }
  });
  
  // Store editable profile data
  const [editableProfile, setEditableProfile] = useState({ ...profile });
  
  useEffect(() => {
    // Load profile from localStorage if available
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setEditableProfile(JSON.parse(savedProfile));
    }
    
    // Load avatar from localStorage if available
    const savedAvatar = localStorage.getItem("userAvatar");
    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, []);
  
  const handleEditToggle = () => {
    if (editMode) {
      // Save changes
      setProfile(editableProfile);
      localStorage.setItem("userProfile", JSON.stringify(editableProfile));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    }
    
    setEditMode(!editMode);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setAvatar(imageDataUrl);
      localStorage.setItem("userAvatar", imageDataUrl);
      setIsUploading(false);
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: "Failed to upload the image. Please try again.",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate("/");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Back button for mobile */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardHeader className="relative pb-0">
                <div className="absolute right-4 top-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditToggle}
                    className="flex items-center gap-2"
                  >
                    {editMode ? (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                      <AvatarImage src={avatar || undefined} alt={profile.name} />
                      <AvatarFallback className="text-2xl">
                        {profile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    {editMode && (
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer"
                      >
                        <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={isUploading}
                        />
                        <Upload className="h-4 w-4" />
                      </label>
                    )}
                  </div>
                  
                  <div className="text-center md:text-left">
                    {editMode ? (
                      <Input
                        name="name"
                        value={editableProfile.name}
                        onChange={handleInputChange}
                        className="text-2xl font-bold mb-1"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold">{profile.name}</h2>
                    )}
                    
                    {editMode ? (
                      <Input
                        name="profession"
                        value={editableProfile.profession}
                        onChange={handleInputChange}
                        className="text-sm text-muted-foreground mb-2"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{profile.profession}</p>
                    )}
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {profile.usageStats.notesCreated} Notes
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Since {profile.joinDate}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="mt-6">
                <Tabs defaultValue="about" className="w-full">
                  <TabsList className="w-full justify-start mb-4">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Bio</h3>
                        {editMode ? (
                          <Textarea
                            name="bio"
                            value={editableProfile.bio}
                            onChange={handleInputChange}
                            rows={4}
                            className="resize-none"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">{profile.bio}</p>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {editMode ? (
                                <Input
                                  name="email"
                                  value={editableProfile.email}
                                  onChange={handleInputChange}
                                  type="email"
                                />
                              ) : (
                                <span>{profile.email}</span>
                              )}
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {editMode ? (
                                <Input
                                  name="phone"
                                  value={editableProfile.phone}
                                  onChange={handleInputChange}
                                  type="tel"
                                />
                              ) : (
                                <span>{profile.phone}</span>
                              )}
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {editMode ? (
                                <Input
                                  name="location"
                                  value={editableProfile.location}
                                  onChange={handleInputChange}
                                />
                              ) : (
                                <span>{profile.location}</span>
                              )}
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              {editMode ? (
                                <Input
                                  name="website"
                                  value={editableProfile.website}
                                  onChange={handleInputChange}
                                  type="url"
                                />
                              ) : (
                                <span>{profile.website}</span>
                              )}
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Account Information</h3>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>Basic Plan</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Member since {profile.joinDate}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stats">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <dl className="space-y-2">
                            <div className="flex justify-between">
                              <dt className="text-sm font-medium">Notes Created</dt>
                              <dd className="text-sm">{profile.usageStats.notesCreated}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm font-medium">Total Pages</dt>
                              <dd className="text-sm">{profile.usageStats.totalPages}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm font-medium">Last Active</dt>
                              <dd className="text-sm">{profile.usageStats.lastActive}</dd>
                            </div>
                          </dl>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Storage</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Used Storage</span>
                              <span className="text-sm">{profile.usageStats.storageUsed}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              You're using 15% of your available storage
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-4">Notification Settings</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications about updates and activity
                            </p>
                          </div>
                          <div>
                            <Button 
                              variant={profile.preferences.notificationEnabled ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                if (editMode) {
                                  setEditableProfile(prev => ({
                                    ...prev,
                                    preferences: {
                                      ...prev.preferences,
                                      notificationEnabled: !prev.preferences.notificationEnabled
                                    }
                                  }));
                                }
                              }}
                              disabled={!editMode}
                            >
                              {profile.preferences.notificationEnabled ? (
                                <Check className="h-4 w-4 mr-1" />
                              ) : null}
                              {profile.preferences.notificationEnabled ? "Enabled" : "Disabled"}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-4">Account Actions</h3>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="text-blue-600">
                            Change Password
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={handleLogout}
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Log Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Render Sidebar for mobile as a floating button/menu */}
      {isMobile && (
        <Sidebar className="hidden" />
      )}
    </div>
  );
};

// Import the Globe icon to complete the component
import { Globe } from "lucide-react";

export default ProfilePage;

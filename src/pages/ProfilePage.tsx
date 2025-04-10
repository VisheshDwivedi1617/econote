
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { 
  User, Settings, Bell, Shield, PenTool, Cloud, 
  Download, Upload, FileText, BarChart, Pencil 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  // User profile state
  const [user, setUser] = useState({
    name: "Jane Doe",
    email: "jane.doe@example.com",
    bio: "Physics student passionate about taking organized notes. EcoNote helps me stay organized and eco-friendly with my digital notes.",
    avatar: "/lovable-uploads/f4922f7f-b535-43b2-95c5-dd0d26787fc1.png",
    location: "San Francisco, CA",
    occupation: "Student",
    notifications: {
      email: true,
      push: true,
      syncReminders: false,
      weeklyDigest: true,
    },
    privacy: {
      publicProfile: false,
      shareNotes: false,
      dataCollection: true,
    },
    penSettings: {
      autoPairOnStartup: true,
      hapticFeedback: true,
      pressureSensitivity: 8,
    },
    cloudSettings: {
      autoSync: true,
      syncOnWifiOnly: true,
      backupFrequency: "daily",
    },
  });
  
  // Stats
  const stats = {
    totalNotes: 56,
    totalPages: 124,
    notesThisMonth: 12,
    wordsWritten: "12,450",
    syncedDevices: 3,
    savedPaper: "124 sheets",
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };
  
  // Handle notification setting changes
  const handleNotificationChange = (setting: keyof typeof user.notifications, value: boolean) => {
    setUser({
      ...user,
      notifications: {
        ...user.notifications,
        [setting]: value,
      },
    });
  };
  
  // Handle privacy setting changes
  const handlePrivacyChange = (setting: keyof typeof user.privacy, value: boolean) => {
    setUser({
      ...user,
      privacy: {
        ...user.privacy,
        [setting]: value,
      },
    });
  };
  
  // Handle pen setting changes
  const handlePenSettingChange = (setting: keyof typeof user.penSettings, value: boolean | number) => {
    setUser({
      ...user,
      penSettings: {
        ...user.penSettings,
        [setting]: value,
      },
    });
  };
  
  // Handle cloud setting changes
  const handleCloudSettingChange = (setting: keyof typeof user.cloudSettings, value: boolean | string) => {
    setUser({
      ...user,
      cloudSettings: {
        ...user.cloudSettings,
        [setting]: value,
      },
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">My Profile</h1>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Summary Card */}
              <Card className="md:w-1/3">
                <CardHeader className="text-center">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                        variant="secondary"
                        size="icon"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="mt-4">{user.name}</CardTitle>
                    <CardDescription>{user.occupation} • {user.location}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h3>
                      <p className="mt-1 text-sm">{user.bio}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Stats</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Total Notes</p>
                          <p className="text-xl font-bold">{stats.totalNotes}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Pages</p>
                          <p className="text-xl font-bold">{stats.totalPages}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Words Written</p>
                          <p className="text-xl font-bold">{stats.wordsWritten}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Paper Saved</p>
                          <p className="text-xl font-bold">{stats.savedPaper}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Your Data
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Settings Tabs */}
              <div className="flex-1">
                <Tabs defaultValue="account">
                  <TabsList className="mb-4 w-full md:w-auto grid grid-cols-4 md:flex h-auto md:h-10">
                    <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <User className="h-4 w-4 mr-2 md:mr-1" />
                      <span className="hidden md:inline">Account</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Bell className="h-4 w-4 mr-2 md:mr-1" />
                      <span className="hidden md:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="pen" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <PenTool className="h-4 w-4 mr-2 md:mr-1" />
                      <span className="hidden md:inline">Pen Settings</span>
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Shield className="h-4 w-4 mr-2 md:mr-1" />
                      <span className="hidden md:inline">Privacy</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Account Settings */}
                  <TabsContent value="account">
                    <Card>
                      <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                          Update your account details and preferences.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input 
                                id="name" 
                                value={user.name}
                                onChange={(e) => setUser({...user, name: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input 
                                id="email" 
                                type="email" 
                                value={user.email}
                                onChange={(e) => setUser({...user, email: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input 
                                id="location" 
                                value={user.location}
                                onChange={(e) => setUser({...user, location: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="occupation">Occupation</Label>
                              <Input 
                                id="occupation" 
                                value={user.occupation}
                                onChange={(e) => setUser({...user, occupation: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea 
                              id="bio" 
                              rows={4}
                              value={user.bio}
                              onChange={(e) => setUser({...user, bio: e.target.value})}
                            />
                          </div>
                        </form>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline">Cancel</Button>
                        <Button onClick={handleSubmit}>Save Changes</Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Cloud Sync</CardTitle>
                        <CardDescription>
                          Configure how your notes sync with the cloud.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Auto Sync</Label>
                            <p className="text-sm text-muted-foreground">
                              Automatically sync notes across devices
                            </p>
                          </div>
                          <Switch 
                            checked={user.cloudSettings.autoSync}
                            onCheckedChange={(checked) => 
                              handleCloudSettingChange("autoSync", checked)
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Sync on Wi-Fi Only</Label>
                            <p className="text-sm text-muted-foreground">
                              Only sync when connected to Wi-Fi
                            </p>
                          </div>
                          <Switch 
                            checked={user.cloudSettings.syncOnWifiOnly}
                            onCheckedChange={(checked) => 
                              handleCloudSettingChange("syncOnWifiOnly", checked)
                            }
                            disabled={!user.cloudSettings.autoSync}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor="backupFrequency">Backup Frequency</Label>
                          <select
                            id="backupFrequency"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={user.cloudSettings.backupFrequency}
                            onChange={(e) => handleCloudSettingChange("backupFrequency", e.target.value)}
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="manual">Manual Only</option>
                          </select>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">
                          <Cloud className="h-4 w-4 mr-2" />
                          Force Sync Now
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  
                  {/* Notifications Settings */}
                  <TabsContent value="notifications">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>
                          Choose what notifications you want to receive.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications via email
                            </p>
                          </div>
                          <Switch 
                            checked={user.notifications.email}
                            onCheckedChange={(checked) => 
                              handleNotificationChange("email", checked)
                            }
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive push notifications on your devices
                            </p>
                          </div>
                          <Switch 
                            checked={user.notifications.push}
                            onCheckedChange={(checked) => 
                              handleNotificationChange("push", checked)
                            }
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Sync Reminders</Label>
                            <p className="text-sm text-muted-foreground">
                              Get reminders to sync your notes
                            </p>
                          </div>
                          <Switch 
                            checked={user.notifications.syncReminders}
                            onCheckedChange={(checked) => 
                              handleNotificationChange("syncReminders", checked)
                            }
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Weekly Digest</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive a weekly summary of your notes
                            </p>
                          </div>
                          <Switch 
                            checked={user.notifications.weeklyDigest}
                            onCheckedChange={(checked) => 
                              handleNotificationChange("weeklyDigest", checked)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Pen Settings */}
                  <TabsContent value="pen">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pen & Writing Settings</CardTitle>
                        <CardDescription>
                          Configure your digital pen and writing preferences.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Auto-Pair on Startup</Label>
                            <p className="text-sm text-muted-foreground">
                              Automatically connect to paired pens when app opens
                            </p>
                          </div>
                          <Switch 
                            checked={user.penSettings.autoPairOnStartup}
                            onCheckedChange={(checked) => 
                              handlePenSettingChange("autoPairOnStartup", checked)
                            }
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Haptic Feedback</Label>
                            <p className="text-sm text-muted-foreground">
                              Enable haptic feedback when using digital pen
                            </p>
                          </div>
                          <Switch 
                            checked={user.penSettings.hapticFeedback}
                            onCheckedChange={(checked) => 
                              handlePenSettingChange("hapticFeedback", checked)
                            }
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Pressure Sensitivity</Label>
                            <span className="text-sm font-medium">
                              {user.penSettings.pressureSensitivity}/10
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={user.penSettings.pressureSensitivity}
                            onChange={(e) => 
                              handlePenSettingChange("pressureSensitivity", parseInt(e.target.value))
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Light</span>
                            <span>Heavy</span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="pt-2">
                          <Button variant="outline" className="w-full">
                            <PenTool className="h-4 w-4 mr-2" />
                            Calibrate Pen
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Connected Devices</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <PenTool className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">Smart Pen Pro</span>
                              </div>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded dark:bg-green-800 dark:text-green-100">
                                Connected
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <PenTool className="h-4 w-4 text-purple-500" />
                                <span className="text-sm">Wacom Stylus</span>
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-200">
                                Paired
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Cloud className="h-4 w-4 mr-2" />
                            Sync All Devices
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            Install Firmware Update
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  {/* Privacy Settings */}
                  <TabsContent value="privacy">
                    <Card>
                      <CardHeader>
                        <CardTitle>Privacy & Security</CardTitle>
                        <CardDescription>
                          Manage your privacy settings and data preferences.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Public Profile</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow others to see your profile information
                            </p>
                          </div>
                          <Switch 
                            checked={user.privacy.publicProfile}
                            onCheckedChange={(checked) => 
                              handlePrivacyChange("publicProfile", checked)
                            }
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Note Sharing</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow notes to be shareable with others
                            </p>
                          </div>
                          <Switch 
                            checked={user.privacy.shareNotes}
                            onCheckedChange={(checked) => 
                              handlePrivacyChange("shareNotes", checked)
                            }
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Usage Data Collection</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow anonymous usage data to improve EcoNote
                            </p>
                          </div>
                          <Switch 
                            checked={user.privacy.dataCollection}
                            onCheckedChange={(checked) => 
                              handlePrivacyChange("dataCollection", checked)
                            }
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col space-y-2">
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Download Your Data
                        </Button>
                        <Button variant="destructive" className="w-full">
                          Delete Account
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sidebar className="hidden" />
      )}
    </div>
  );
};

export default ProfilePage;

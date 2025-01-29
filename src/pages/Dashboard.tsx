import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import DeviceCard from "@/components/DeviceCard";
import { getDevices, createDevice, toggleDevice, Device } from "@/api/devices";
import { getMe } from "@/api/auth";
import { useWebSocket } from "@/hooks/useWebSocket";

const Dashboard = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleWebSocketMessage = async (message: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (message.type === 'device_connect') {
      toast({
        title: "Device Connected",
        description: `Device ${message.deviceId} connected`,
      });
    } 
    else if (message.type === 'device_update') {
      try {
        // Fetch fresh device data from the database
        const updatedDevices = await getDevices(token);
        setDevices(updatedDevices);
        
        // Show appropriate toast message based on the action
        if (message.action === 'created') {
          toast({
            title: "New Device",
            description: `Device ${message.device.device_id} has been added`,
          });
        } else if (message.action === 'updated') {
          toast({
            title: "Device Updated",
            description: `Device ${message.device.device_id} has been updated`,
          });
        } else if (message.action === 'disconnected') {
          toast({
            title: "Device Disconnected",
            description: `Device ${message.device.device_id} has disconnected`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Failed to fetch updated devices:', error);
      }
    }
  };

  const { sendMessage } = useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, devicesResponse] = await Promise.all([
          getMe(token),
          getDevices(token)
        ]);
        setUsername(userResponse.username);
        setDevices(devicesResponse);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        localStorage.removeItem('token');
        navigate('/signin');
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const handleAddDevice = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const deviceId = prompt('Enter device ID:');
    if (!deviceId) return;

    try {
      const newDevice = await createDevice(deviceId, token);
      setDevices([...devices, newDevice]);
      toast({
        title: "Success",
        description: "Device added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to add device",
        variant: "destructive",
      });
    }
  };

  const handleToggleDevice = async (deviceId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await toggleDevice(deviceId, token);
      setDevices(devices.map(device => 
        device.device_id === deviceId 
          ? { ...device, is_active: !device.is_active }
          : device
      ));
      
      // Send WebSocket message about device state change
      sendMessage({
        type: 'lesson_state_change',
        deviceId: deviceId,
        isActive: !devices.find(d => d.device_id === deviceId)?.is_active
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to toggle device",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar username={username} onLogout={handleLogout} />
      
      <main className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Devices</h1>
          {/* <Button onClick={handleAddDevice}>Add Device</Button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device, id) => (
            <DeviceCard
              key={device.id}
              deviceId={String(id+1)}
              isActive={device.is_active}
              status={device.status}
              onToggleActive={() => handleToggleDevice(device.device_id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 
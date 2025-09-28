import { Mic } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MicrophoneSelectorProps {
  availableDevices: MediaDeviceInfo[];
  selectedDeviceId: string | null;
  hasPermission: boolean;
  onSelectDevice: (deviceId: string) => void;
  onRequestPermissions: () => Promise<void>;
}

export const MicrophoneSelector = ({
  availableDevices,
  selectedDeviceId,
  hasPermission,
  onSelectDevice,
  onRequestPermissions,
}: MicrophoneSelectorProps) => {
  if (!hasPermission) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Microphone Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onRequestPermissions}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Grant Microphone Access
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (availableDevices.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Mic className="h-4 w-4" />
            No Microphones Found
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Mic className="h-4 w-4" />
          Microphone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedDeviceId || ""} onValueChange={onSelectDevice}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select microphone..." />
          </SelectTrigger>
          <SelectContent>
            {availableDevices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
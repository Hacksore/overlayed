import { Download } from "lucide-react";

import { installUpdate, type UpdateStatus } from "@tauri-apps/api/updater";
import { relaunch } from "@tauri-apps/api/process";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";

export const Updater = ({
  update,
}: {
  update: { isAvailable: boolean; status: UpdateStatus | null; error: string };
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    (async () => {
      await listen("show_update_modal", () => {
        setDialogOpen(true);
      });
    })();
  }, []);

  if (update.isAvailable && update.status !== null) {
    return (
      <div className="py-2 h-[48px] bg-green-600">
        <div className="!text-white text-xl font-bold cursor-pointer flex gap-2 items-center justify-center">
          <p>Updating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[48px] bg-blue-500">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <button className="w-full">
            <div className="text-white font-bold cursor-pointer flex gap-2 items-center justify-center">
              <Download />
              <p>Update Available! Click here to update</p>
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="w-[80%]">
          <form
            onSubmit={async () => {
              // TODO:
              console.log("installing update");
              try {
                await installUpdate();
                await relaunch();
              } catch (e) {
                console.error(e);
              }
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl mb-4 text-white">Update Overlayed</DialogTitle>
              <DialogDescription className="text-xl mb-4 text-white">
                Are you sure you want to update Overlayed?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

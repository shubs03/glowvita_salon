import { Button } from "@repo/ui/button";
import { Download } from "lucide-react";

const AppStoreButtons = () => (
  <div className="flex justify-center flex-col sm:flex-row gap-4 mt-8">
    <Button
      size="lg"
      className="w-full sm:w-auto bg-black hover:bg-black/80 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
    >
      <Download className="mr-2 h-5 w-5" /> Download on the App Store
    </Button>
    <Button
      size="lg"
      variant="outline"
      className="w-full sm:w-auto rounded-full shadow-lg hover:shadow-xl transition-all"
    >
      <Download className="mr-2 h-5 w-5" /> Get it on Google Play
    </Button>
  </div>
);

export default AppStoreButtons;
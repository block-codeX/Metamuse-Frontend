import { useState } from "react";
import { useCanvas } from "../contexts/canvas-context";
import GradientFormatting from "../drawing/formatting/gradient";
import PatternFormatting from "../drawing/formatting/patterns";
import PictureFormatting from "../drawing/formatting/picture-filters";
import TextFormatting from "../drawing/formatting/text";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const FloatingTools = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="absolute top-41 right-20 z-50 flex items-start">
      <Button
        onClick={toggleExpand}
        className="h-auto w-5 relative z-5 cursor-pointer bg-background hover:bg-background/90 text-text-primary rounded-none shadow-md p-1 border border-gray-300 border-t-transparent border-r-transparent transition-all duration-200"
      >
        {isExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "300px", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-background/80 backdrop-blur-sm rounded-md shadow-md border border-gray-300 ml-2 overflow-hidden"
          >
            <Tabs defaultValue="text" className="w-full">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="p-3"
              >
                <TabsList className="flex gap-2 w-full justify-start">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="gradient">Gradient</TabsTrigger>
                  <TabsTrigger value="pattern">Pattern</TabsTrigger>
                  <TabsTrigger value="picture">Picture</TabsTrigger>
                </TabsList>
              </motion.div>
              
              <div className="p-3 pt-0 h-80 overflow-auto">
                <TabsContent value="text" className="mt-2">
                  <TextFormatting />
                </TabsContent>
                <TabsContent value="gradient" className="mt-2">
                  <GradientFormatting />
                </TabsContent>
                <TabsContent value="pattern" className="mt-2">
                  <PatternFormatting />
                </TabsContent>
                <TabsContent value="picture" className="mt-2">
                  <PictureFormatting />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingTools;
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/app/context/AppContext";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginComponent from "./LoginComponent";
import RegisterComponent from "./RegisterComponent";
import { useI18n } from "@/app/context/I18nContext";

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { authOpen, setAuthOpen } = useStore();
  const { t } = useI18n();

  // Reset tab to login when modal is closed and reopened
  useEffect(() => {
    if (authOpen) {
      setActiveTab("login");
    }
  }, [authOpen]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="w-full mx-auto">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">{t("header.login")}</TabsTrigger>
          <TabsTrigger value="register">{t("header.register")}</TabsTrigger>
        </TabsList>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="login" className="mt-0">
              <LoginComponent 
                isModal={true} 
                onSuccess={() => setAuthOpen(false)}
              />
            </TabsContent>
            
            <TabsContent value="register" className="mt-0">
              <RegisterComponent 
                isModal={true} 
                onSuccess={() => setAuthOpen(false)}
              />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}




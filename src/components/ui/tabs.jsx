"use client";

import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, children, className = "" }) {
  const [selectedTab, setSelectedTab] = useState(defaultValue);
  const currentTab = value !== undefined ? value : selectedTab;

  const handleTabChange = (val) => {
    if (value === undefined) {
      setSelectedTab(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <TabsContext.Provider value={{ currentTab, changeTab: handleTabChange }}>
      <div className={`tabs ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className = "" }) {
  return <div className={`tab-list flex gap-2 border-b ${className}`}>{children}</div>;
}

export function TabTrigger({ value, children, className = "", onClick, ...props }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx ? ctx.currentTab === value : false;

  const handleClick = (e) => {
    if (ctx) ctx.changeTab(value);
    if (onClick) onClick(e);
  };

  return (
    <button
      type="button"
      className={`tab-trigger ${isActive ? "active" : ""} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabContent({ value, children, className = "", ...props }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx ? ctx.currentTab === value : false;

  if (!isActive) return null;

  return (
    <div className={`tab-content active ${className}`} {...props}>
      {children}
    </div>
  );
}

import React from "react";
import { useEffect } from 'react';
import {
    Dropdown,
    DropdownGroup,
    GroupTitle,
    GroupItem,
    QuickActions,
    Disc,
    DropdownWrapper,
    DropdownTrigger
} from "./Dropdown";

const withDarkModeControl = (Story, context) => {
    const { darkmode = false } = context.args;

    useEffect(() => {
        if (darkmode) {
            document.body.setAttribute("data-dark", "true");
        } else {
            document.body.removeAttribute("data-dark");
        }
        return () => { document.body.removeAttribute("data-dark"); };
    }, [darkmode]);

    return <Story />;
};

const meta = {
    title: "Z-kit/Dropdown",
    component: Dropdown,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: { component: "A dropdown menu component with automatic separators between groups" }
        }
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        debugSafetyCone: {
            control: { type: "boolean" },
            name: "Debug Safety Cone",
            description: "Toggle debug safety cone mode for development",
            defaultValue: false,
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when an item is clicked",
        },
    }
};

export default meta;

export const dropdown = {
    args: { darkmode: false, debugSafetyCone: false },
    render: (args) => (

        <Dropdown maxHeight={250}>
            <DropdownGroup>
                <GroupTitle>Fruits</GroupTitle>
                <GroupItem mode="icons" shortcut="ctrl a">
                    <Disc color="red" />Apple</GroupItem>
                <GroupItem mode="icons" shortcut="ctrl o"><Disc color="orange" />Orange</GroupItem>
                <GroupItem mode="icons" shortcut="ctrl b"><Disc color="yellow" />Banana</GroupItem>
            </DropdownGroup>
            <DropdownGroup>
                <GroupTitle>Vegetables</GroupTitle>
                <GroupItem mode="icons" shortcut="ctrl c"><Disc color="lime" />Carrot</GroupItem>
                <GroupItem mode="icons" shortcut="ctrl r"><Disc color="green" />Broccoli</GroupItem>
                <GroupItem mode="icons" shortcut="ctrl s"><Disc color="lightBlue" />Spinach</GroupItem>
            </DropdownGroup>
            <DropdownGroup>
                <GroupTitle>Dairy</GroupTitle>
                <GroupItem mode="icons" shortcut="ctrl a"><Disc color="primary" />Milk</GroupItem>
                <GroupItem mode="icons" shortcut="ctrl o"><Disc color="purple" />Cheese</GroupItem>
                <GroupItem mode="icons" shortcut="ctrl b"><Disc color="pink" />Butter</GroupItem>
                <GroupItem mode="icons" shortcut="ctrl b"><Disc color="gray" />Cream</GroupItem>
            </DropdownGroup>
        </Dropdown>
    )
};

export const contextMenu = {
    args: { darkmode: false, debugSafetyCone: false },
    render: (args) => (
        <Dropdown search={true} contextMenu={true}>
            <DropdownGroup>
                <GroupTitle>File</GroupTitle>
                <GroupItem mode="icons" shortcut="ctrl c" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                    Copy
                </GroupItem>
                <GroupItem mode="icons" shortcut="ctrl v" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
                    Paste
                </GroupItem>
                <GroupItem mode="icons" shortcut="ctrl x" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3" /><path d="M8.12 8.12 12 12" /><path d="M20 4 8.12 15.88" /><circle cx="6" cy="18" r="3" /><path d="M14.8 14.8 20 20" /></svg>
                    Cut
                </GroupItem>
                <GroupItem mode="icons" shortcut="ctrl d" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z" /><path d="m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845" /></svg>
                    duplicate
                </GroupItem>
            </DropdownGroup>
            <DropdownGroup>
                <GroupTitle>Edit</GroupTitle>
                <GroupItem mode="icons" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></svg>
                    Convert to...
                    <Dropdown>
                        <DropdownGroup>
                            <GroupTitle>Formats</GroupTitle>
                            <GroupItem><Disc color="red" />PDF</GroupItem>
                            <GroupItem><Disc color="primary" />Word
                            </GroupItem>
                            <GroupItem><Disc color="orange" />SVG</GroupItem>
                        </DropdownGroup>
                    </Dropdown>
                </GroupItem>
                <GroupItem mode="icons" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></svg>
                    Export as...
                    <Dropdown>
                        <DropdownGroup>
                            <GroupTitle>Formats</GroupTitle>
                            <GroupItem><Disc color="red" />PDF</GroupItem>
                            <GroupItem><Disc color="primary" />Word</GroupItem>
                            <GroupItem><Disc color="orange" />SVG</GroupItem>
                        </DropdownGroup>
                    </Dropdown>
                </GroupItem>
            </DropdownGroup>
            <DropdownGroup>
                <GroupTitle>Danger zone</GroupTitle>
                <GroupItem mode="icons" shortcut="bsp" danger={true} debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    delete
                </GroupItem>
            </DropdownGroup>
        </Dropdown>
    )
};

export const contextMenuWithActions = {
    args: { darkmode: false, debugSafetyCone: false },
    render: (args) => (
        <Dropdown search={true} contextMenu={true}>
            <DropdownGroup>
                <QuickActions>
                    <GroupItem mode="icons" debugSafetyCone={args.debugSafetyCone}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v13" /><path d="m16 6-4-4-4 4" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /></svg>
                        share
                    </GroupItem>
                    <GroupItem mode="icons" debugSafetyCone={args.debugSafetyCone}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" /><path d="M7 3v4a1 1 0 0 0 1 1h7" /></svg>
                        save
                    </GroupItem>
                    <GroupItem mode="icons" danger={true} debugSafetyCone={args.debugSafetyCone}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        delete
                    </GroupItem>
                </QuickActions>
                <GroupTitle>File</GroupTitle>
                <GroupItem mode="icons" shortcut="ctrl c" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                    Copy
                </GroupItem>
                <GroupItem mode="icons" shortcut="ctrl v" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
                    Paste
                </GroupItem>
                <GroupItem mode="icons" shortcut="ctrl x" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3" /><path d="M8.12 8.12 12 12" /><path d="M20 4 8.12 15.88" /><circle cx="6" cy="18" r="3" /><path d="M14.8 14.8 20 20" /></svg>
                    Cut
                </GroupItem>
                <GroupItem mode="icons" shortcut="ctrl d" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z" /><path d="m20 14.285 1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845" /></svg>
                    duplicate
                </GroupItem>
            </DropdownGroup>
            <DropdownGroup>
                <GroupTitle>Edit</GroupTitle>
                <GroupItem mode="icons" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></svg>
                    Convert to...
                    <Dropdown>
                        <DropdownGroup>
                            <GroupTitle>Formats</GroupTitle>
                            <GroupItem><Disc color="red" />PDF</GroupItem>
                            <GroupItem><Disc color="primary" />Word</GroupItem>
                            <GroupItem><Disc color="orange" />SVG</GroupItem>
                        </DropdownGroup>
                    </Dropdown>
                </GroupItem>
                <GroupItem mode="icons" debugSafetyCone={args.debugSafetyCone}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></svg>
                    Export as...
                    <Dropdown>
                        <DropdownGroup>
                            <GroupTitle>Formats</GroupTitle>
                            <GroupItem><Disc color="red" />PDF</GroupItem>
                            <GroupItem><Disc color="primary" />Word</GroupItem>
                            <GroupItem><Disc color="orange" />SVG</GroupItem>
                        </DropdownGroup>
                    </Dropdown>
                </GroupItem>
            </DropdownGroup>
        </Dropdown>
    )
};
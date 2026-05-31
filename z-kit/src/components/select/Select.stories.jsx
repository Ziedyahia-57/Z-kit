import { Select } from './Select';
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
} from "../dropdown/Dropdown";


// Decorator that responds to a darkMode arg
const withDarkModeControl = (Story, context) => {
    const { darkmode = false } = context.args;

    useEffect(() => {
        if (darkmode) {
            document.body.setAttribute("data-dark", "true");
        } else {
            document.body.removeAttribute("data-dark");
        }

        return () => {
            document.body.removeAttribute("data-dark");
        };
    }, [darkmode]);

    return (
        <Story />
    );
};

const meta = {
    title: "Z-kit/Select",
    component: Select,
    tags: ["autodocs"],
    decorators: [withDarkModeControl],
    parameters: {
        docs: {
            description: {
                story: "Select UI Component",
            },
        },
    },
    argTypes: {
        darkmode: {
            control: { type: "boolean" },
            name: "Dark Mode",
            description: "Toggle dark mode theme",
        },
        placeholder: {
            control: { type: "text" },
            name: "Placeholder",
            description: "Placeholder text for the input",
        },
        disabled: {
            control: { type: "boolean" },
            name: "Disabled",
            description: "Defines if the button is disabled",
        },
        error: {
            control: { type: "boolean" },
            name: "Error",
            description: "Defines if the button is in an error state",
            if: { arg: "disabled", neq: "true" },
        },
        onClick: {
            action: "clicked",
            name: "onClick",
            description: "Defines the action to be performed when the accordion is clicked",
        },
    },
};

export default meta;

export const select = {
    args: {
        darkmode: false,
        label: 'label',
        placeholder: "Placeholder",
        disabled: false,
        error: false,
    },

    render: (args) => {
        const { darkmode, ...selectArgs } = args;
        return (
            <DropdownWrapper>
                <DropdownTrigger><Select placeholder="Choose one..." {...selectArgs}>Item</Select></DropdownTrigger>
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
            </DropdownWrapper>
        )
    }
};
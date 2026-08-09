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
        const main = document.querySelector(".sb-show-main");

        if (darkmode) {
            document.body.setAttribute("data-dark", "true");
            main?.style.setProperty("background", "var(--gray-950)", "important");
        } else {
            document.body.removeAttribute("data-dark");
            main?.style.setProperty("background", "var(--gray-25)", "important");
        }

        return () => {
            document.body.removeAttribute("data-dark");
            main?.style.removeProperty("background");
        };
    }, [darkmode]);

    return <Story />;
};

const withRTLControl = (Story, context) => {
    const { rtl = false } = context.args;

    return (
        <div className={rtl ? "rtl" : ""}>
            <Story />
        </div>
    );
};

const meta = {
    title: "Z-kit/Select",
    component: Select,
    tags: ["autodocs"],
    decorators: [withDarkModeControl, withRTLControl],
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
        label: 'item',
        placeholder: "Empty",
        disabled: false,
        error: false,
    },

    render: (args) => {
        const { darkmode, ...selectArgs } = args;
        return (
            <DropdownWrapper>
                <DropdownTrigger><Select placeholder={args.placeholder} {...selectArgs}>{args.label}</Select></DropdownTrigger>
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

export const selectRTL = {
    name: "Select (rtl)",
    args: {
        darkmode: false,
        label: 'العنصر',
        placeholder: "فارغ",
        disabled: false,
        error: false,
        rtl: true,
    },

    render: (args) => {
        const { darkmode, ...selectArgs } = args;
        return (
            <DropdownWrapper>
                <DropdownTrigger>
                    <Select placeholder={args.placeholder} {...selectArgs}>{args.label}</Select>
                </DropdownTrigger>
                <Dropdown maxHeight={250}>
                    <DropdownGroup>
                        <GroupTitle>الفواكه</GroupTitle>
                        <GroupItem mode="icons" shortcut="ctrl a">
                            <Disc color="red" />تفاح
                        </GroupItem>
                        <GroupItem mode="icons" shortcut="ctrl o">
                            <Disc color="orange" />برتقال
                        </GroupItem>
                        <GroupItem mode="icons" shortcut="ctrl b">
                            <Disc color="yellow" />موز
                        </GroupItem>
                    </DropdownGroup>

                    <DropdownGroup>
                        <GroupTitle>الخضروات</GroupTitle>
                        <GroupItem mode="icons" shortcut="ctrl c">
                            <Disc color="lime" />جزر
                        </GroupItem>
                        <GroupItem mode="icons" shortcut="ctrl r">
                            <Disc color="green" />بروكلي
                        </GroupItem>
                        <GroupItem mode="icons" shortcut="ctrl s">
                            <Disc color="lightBlue" />سبانخ
                        </GroupItem>
                    </DropdownGroup>

                    <DropdownGroup>
                        <GroupTitle>منتجات الألبان</GroupTitle>
                        <GroupItem mode="icons" shortcut="ctrl a">
                            <Disc color="primary" />حليب
                        </GroupItem>
                        <GroupItem mode="icons" shortcut="ctrl o">
                            <Disc color="purple" />جبن
                        </GroupItem>
                        <GroupItem mode="icons" shortcut="ctrl b">
                            <Disc color="pink" />زبدة
                        </GroupItem>
                        <GroupItem mode="icons" shortcut="ctrl b">
                            <Disc color="gray" />قشطة
                        </GroupItem>
                    </DropdownGroup>
                </Dropdown>
            </DropdownWrapper>
        )
    }
};
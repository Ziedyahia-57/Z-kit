import React from 'react';
import { PromptInput } from './PromptInput';

const meta = {
    title: 'Z-kit/Prompt Input',
    component: PromptInput,
    parameters: {
        docs: {
            description: {
                component:
                    'A prompt input component for entering text, attaching files, selecting response settings, and submitting prompts.',
            },
        },
    },
    argTypes: {
        placeholder: {
            control: 'text',
            description: 'Placeholder text displayed inside the prompt input.',
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the prompt input and submit button.',
        },
        models: {
            control: 'object',
            description:
                'Available models and their supported output formats and effort options.',
        },
        onChange: {
            action: 'changed',
            description: 'Called whenever the prompt value changes.',
        },
        onFocus: {
            action: 'focused',
            description: 'Called when the prompt input receives focus.',
        },
        onBlur: {
            action: 'blurred',
            description: 'Called when the prompt input loses focus.',
        },
        onSubmit: {
            action: 'submitted',
            description: 'Called when the submit button is clicked.',
        },
        onAttach: {
            action: 'attached',
            description: 'Called when a file is pasted into the prompt.',
        },
        children: {
            control: false,
            description: 'Optional content rendered below the prompt.',
        },
    },
};

export default meta;

export const Prompt = {
    args: {
        placeholder: 'Ask anything...',
        disabled: false,
        models: [
            {
                id: 'gpt-5',
                name: 'GPT-5',
                outputFormats: ['Text', 'Image'],
            },
            {
                id: 'gpt-5-mini',
                name: 'GPT-5 Mini',
                outputFormats: ['Text'],
            },
        ],
    },
};
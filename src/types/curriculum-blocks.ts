// Block type definitions for curriculum architect

export interface BaseBlock {
    id: string;
    type: BlockType;
    order: number;
}

export type BlockType =
    | "text"
    | "image"
    | "instructions"
    | "materials"
    | "checklist"
    | "worksheet"
    | "timetable"
    | "content";

export interface TextBlock extends BaseBlock {
    type: "text";
    data: {
        content: string; // Rich HTML content
        backgroundColor?: string;
        textColor?: string;
    };
}

export interface ImageBlock extends BaseBlock {
    type: "image";
    data: {
        images: {
            id: string;
            url: string;
            caption?: string;
            alt?: string;
        }[];
        layout?: "single" | "grid" | "carousel";
    };
}

export interface ContentBlock extends BaseBlock {
    type: "content";
    data: {
        content: string; // Rich HTML content
        images?: {
            id: string;
            url: string;
            caption?: string;
            alt?: string;
        }[];
        layout?: "top" | "bottom" | "split-left" | "split-right"; // Text position relative to images
    };
}

export interface InstructionsBlock extends BaseBlock {
    type: "instructions";
    data: {
        title: string;
        steps: {
            id: string;
            text: string;
            isImportant?: boolean;
            duration?: string;
        }[];
        notes?: string;
    };
}

export interface MaterialsBlock extends BaseBlock {
    type: "materials";
    data: {
        title: string;
        items: {
            id: string;
            name: string;
            quantity: string;
            category: "stationery" | "toys" | "food" | "craft" | "other";
            checked?: boolean;
        }[];
    };
}

export interface ChecklistBlock extends BaseBlock {
    type: "checklist";
    data: {
        title: string;
        tasks: {
            id: string;
            text: string;
            duration?: string;
            priority?: "high" | "medium" | "low";
            checked?: boolean;
        }[];
    };
}

export interface WorksheetBlock extends BaseBlock {
    type: "worksheet";
    data: {
        worksheets: {
            id: string;
            name: string;
            url: string;
            size: string;
            uploadDate: string;
            category?: "activity" | "assessment" | "homework" | "practice";
        }[];
    };
}

export interface TimetableBlock extends BaseBlock {
    type: "timetable";
    data: {
        schedule: {
            id: string;
            startTime: string;
            endTime: string;
            activity: string;
            color?: string;
            description?: string;
        }[];
    };
}

export type Block =
    | TextBlock
    | ImageBlock
    | ContentBlock
    | InstructionsBlock
    | MaterialsBlock
    | ChecklistBlock
    | WorksheetBlock
    | TimetableBlock;

// Helper function to create a new block
export function createBlock(type: BlockType, order: number): Block {
    const baseBlock = {
        id: Math.random().toString(36).substr(2, 9),
        order
    };

    switch (type) {
        case "text":
            return {
                ...baseBlock,
                type: "text",
                data: { content: "" }
            };
        case "image":
            return {
                ...baseBlock,
                type: "image",
                data: { images: [], layout: "grid" }
            };
        case "content":
            return {
                ...baseBlock,
                type: "content",
                data: {
                    content: "",
                    images: [],
                    layout: "bottom"
                }
            };
        case "instructions":
            return {
                ...baseBlock,
                type: "instructions",
                data: {
                    title: "Instructions for Teacher",
                    steps: [],
                    notes: ""
                }
            };
        case "materials":
            return {
                ...baseBlock,
                type: "materials",
                data: {
                    title: "Materials Required",
                    items: []
                }
            };
        case "checklist":
            return {
                ...baseBlock,
                type: "checklist",
                data: {
                    title: "Activity Checklist",
                    tasks: []
                }
            };
        case "worksheet":
            return {
                ...baseBlock,
                type: "worksheet",
                data: { worksheets: [] }
            };
        case "timetable":
            return {
                ...baseBlock,
                type: "timetable",
                data: {
                    schedule: [
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            startTime: "09:00",
                            endTime: "09:30",
                            activity: "Circle Time"
                        }
                    ]
                }
            };
    }
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getMyClassTeacherClassroomsAction } from "@/app/actions/class-teacher-actions";

export interface ClassTeacherClassroom {
    id: string;
    name: string;
    teacherId: string | null;
    students: { id: string }[];
}

interface ClassTeacherContextValue {
    /** Is the current user a Class Teacher for at least one class? */
    isClassTeacher: boolean;
    /** All classrooms where this user is the Class Teacher */
    classTeacherClassrooms: ClassTeacherClassroom[];
    /** Quick lookup: is this user Class Teacher of a specific classroom ID? */
    isClassTeacherOf: (classroomId: string) => boolean;
    /** All student IDs across all their managed classes */
    managedStudentIds: string[];
    isLoading: boolean;
}

const ClassTeacherContext = createContext<ClassTeacherContextValue>({
    isClassTeacher: false,
    classTeacherClassrooms: [],
    isClassTeacherOf: () => false,
    managedStudentIds: [],
    isLoading: true
});

export function ClassTeacherProvider({
    children,
    schoolSlug
}: {
    children: React.ReactNode;
    schoolSlug: string;
}) {
    const [classrooms, setClassrooms] = useState<ClassTeacherClassroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getMyClassTeacherClassroomsAction(schoolSlug).then(res => {
            if (res.success) {
                setClassrooms(res.classrooms || []);
            }
            setIsLoading(false);
        });
    }, [schoolSlug]);

    const isClassTeacherOf = (classroomId: string) =>
        classrooms.some(c => c.id === classroomId);

    const managedStudentIds = classrooms.flatMap(c =>
        c.students.map(s => s.id)
    );

    return (
        <ClassTeacherContext.Provider value={{
            isClassTeacher: classrooms.length > 0,
            classTeacherClassrooms: classrooms,
            isClassTeacherOf,
            managedStudentIds,
            isLoading
        }}>
            {children}
        </ClassTeacherContext.Provider>
    );
}

/** Hook to access Class Teacher context anywhere in the dashboard */
export function useClassTeacher() {
    return useContext(ClassTeacherContext);
}

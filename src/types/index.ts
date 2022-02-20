export interface IPost {
    tags: any[],
    owner: any[],
    descriptionComponent?: string,
    is_answered: boolean,
    view_count: number,
    answer_count: number,
    score: number,
    last_activity_date: number,
    creation_date: number,
    question_id: number,
    content_license: string,
    link: string,
    title: string
}

export interface ITag {
    name: string;
    count: number;
}

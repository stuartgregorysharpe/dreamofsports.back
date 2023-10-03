export interface IChildable {
    id: number;
    parent_id?: number;
    children?: IChildable[];
    _shift?: string;
    _level?: number;
}

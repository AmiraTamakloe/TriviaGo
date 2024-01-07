import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Injectable({
    providedIn: 'root',
})
export class PaginatorHandlerService {
    private startIndex: number;
    private endIndex: number;

    handlePageChange<T>(event: PageEvent, items: T[]): T[] {
        this.startIndex = event.pageIndex * event.pageSize;
        this.endIndex = this.startIndex + event.pageSize;
        return items.slice(this.startIndex, this.endIndex);
    }
}

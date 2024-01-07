import { TestBed } from '@angular/core/testing';
import { PageEvent } from '@angular/material/paginator';
import { PaginatorHandlerService } from '@app/services/paginator-handler/paginator-handler.service';
import { NUMBER_OF_GAMES_PER_PAGE } from '@common/constants';

describe('PaginatorHandlerService', () => {
    let service: PaginatorHandlerService;
    let items: string[];
    let newItems: string[];
    let event: PageEvent;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PaginatorHandlerService);
        items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
        newItems = ['i', 'j'];
        event = new PageEvent();
        event.pageIndex = 1;
        event.pageSize = NUMBER_OF_GAMES_PER_PAGE;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('startIndex should be calculated correctly', () => {
        items = service.handlePageChange(event, items);
        expect(service['startIndex']).toBe(event.pageIndex * event.pageSize);
    });

    it('endIndex should be calculated correctly', () => {
        items = service.handlePageChange(event, items);
        expect(service['endIndex']).toBe(service['startIndex'] + event.pageSize);
    });

    it('should return items to be displayed', () => {
        items = service.handlePageChange(event, items);
        expect(items).toEqual(newItems);
    });
});

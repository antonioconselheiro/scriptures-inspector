import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseScripture } from './base-scripture';

describe('BaseScripture', () => {
  let component: BaseScripture;
  let fixture: ComponentFixture<BaseScripture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseScripture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseScripture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

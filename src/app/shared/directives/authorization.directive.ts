import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  ComponentFactoryResolver,
  ElementRef
} from "@angular/core";
import { AuthService } from "@shared/services/auth.service";
import { NotAuthorizedComponent } from "@shared/components/not-authorized/not-authorized.component";
@Directive({
  selector: "[authorization]"
})
export class AuthorizationDirective implements OnInit {
  @Input()
  authorization: string | { actionName: string; pageLevel: boolean };
  constructor(
    private templateRef: TemplateRef<any>,
    private _viewContainer: ViewContainerRef,
    private _authService: AuthService,
    private _resolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
   /* const actionName =
      typeof this.authorization == "string"
        ? this.authorization
        : this.authorization.actionName;
    const pageLevel =
      typeof this.authorization == "string"
        ? false
        : this.authorization.pageLevel;

   // if (
      //this._authService.currentAuthUser.CurrentPermission.includes(actionName)
   // ) 
   {
      this._viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this._viewContainer.clear();
      if (pageLevel) {
        this._viewContainer.createComponent(
          this._resolver.resolveComponentFactory(NotAuthorizedComponent)
        );
      }
    }*/
  }
}

import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    mixin,
    Type,
  } from '@nestjs/common'
import { Role } from 'src/schema'
  
  const RoleGuard = (role: Role): Type<CanActivate> => {
    class RoleGuardMixin implements CanActivate {
      canActivate(context: ExecutionContext) {
        try {
          const request = context.switchToHttp().getRequest<any>()
          const { user } = request
          const canContinue = user?.role.includes(role)
          if (!canContinue) {
            throw new ForbiddenException(
              'Permission denined, can not access resources',
            )
          }
          return canContinue
        } catch (error) {
          throw new ForbiddenException(error.message)
        }
      }
    }
    return mixin(RoleGuardMixin)
  }
  
  export default RoleGuard
  
import type { IFeeds, PushAPI } from '@pushprotocol/restapi';
import * as PUSHAPI from '@pushprotocol/restapi';
import { IMessageIPFS } from '@pushprotocol/restapi';
import { ENV } from '../../config';
import { ChatFeedsType, LocalStorageKeys } from '../../types';

type SetDataType = {
  chatId: string;
  value: IFeeds;
};

// store default pfp image
const defaultPfp =
  'data:image/jpeg;base64,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Y3RvckRhdGFib29sAQAAAABQZ1BzZW51bQAAAABQZ1BzAAAAAFBnUEMAAAAATGVmdFVudEYjUmx0AAAAAAAAAAAAAAAAVG9wIFVudEYjUmx0AAAAAAAAAAAAAAAAU2NsIFVudEYjUHJjQFkAAAAAAAAAAAAQY3JvcFdoZW5QcmludGluZ2Jvb2wAAAAADmNyb3BSZWN0Qm90dG9tbG9uZwAAAAAAAAAMY3JvcFJlY3RMZWZ0bG9uZwAAAAAAAAANY3JvcFJlY3RSaWdodGxvbmcAAAAAAAAAC2Nyb3BSZWN0VG9wbG9uZwAAAAAAOEJJTQPtAAAAAAAQAEgAAAABAAIASAAAAAEAAjhCSU0EJgAAAAAADgAAAAAAAAAAAAA/gAAAOEJJTQPyAAAAAAAKAAD///////8AADhCSU0EDQAAAAAABAAAAB44QklNBBkAAAAAAAQAAAAeOEJJTQPzAAAAAAAJAAAAAAAAAAABADhCSU0nEAAAAAAACgABAAAAAAAAAAE4QklNA/UAAAAAAEgAL2ZmAAEAbGZmAAYAAAAAAAEAL2ZmAAEAoZmaAAYAAAAAAAEAMgAAAAEAWgAAAAYAAAAAAAEANQAAAAEALQAAAAYAAAAAAAE4QklNA/gAAAAAAHAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAOEJJTQQIAAAAAAAQAAAAAQAAAkAAAAJAAAAAADhCSU0ERAAAAAAAEAAAAAIAAAJAAAACQAAAAAA4QklNBB4AAAAAAAQAAAAAOEJJTQQaAAAAAANLAAAABgAAAAAAAAAAAAAAgAAAAIAAAAALAEQAZQBmAGEAdQBsAHQAXwBwAGYAcAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAgAAAAIAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAQAAAAAAAG51bGwAAAACAAAABmJvdW5kc09iamMAAAABAAAAAAAAUmN0MQAAAAQAAAAAVG9wIGxvbmcAAAAAAAAAAExlZnRsb25nAAAAAAAAAABCdG9tbG9uZwAAAIAAAAAAUmdodGxvbmcAAACAAAAABnNsaWNlc1ZsTHMAAAABT2JqYwAAAAEAAAAAAAVzbGljZQAAABIAAAAHc2xpY2VJRGxvbmcAAAAAAAAAB2dyb3VwSURsb25nAAAAAAAAAAZvcmlnaW5lbnVtAAAADEVTbGljZU9yaWdpbgAAAA1hdXRvR2VuZXJhdGVkAAAAAFR5cGVlbnVtAAAACkVTbGljZVR5cGUAAAAASW1nIAAAAAZib3VuZHNPYmpjAAAAAQAAAAAAAFJjdDEAAAAEAAAAAFRvcCBsb25nAAAAAAAAAABMZWZ0bG9uZwAAAAAAAAAAQnRvbWxvbmcAAACAAAAAAFJnaHRsb25nAAAAgAAAAAN1cmxURVhUAAAAAQAAAAAAAG51bGxURVhUAAAAAQAAAAAAAE1zZ2VURVhUAAAAAQAAAAAABmFsdFRhZ1RFWFQAAAABAAAAAAAOY2VsbFRleHRJc0hUTUxib29sAQAAAAhjZWxsVGV4dFRFWFQAAAABAAAAAAAJaG9yekFsaWduZW51bQAAAA9FU2xpY2VIb3J6QWxpZ24AAAAHZGVmYXVsdAAAAAl2ZXJ0QWxpZ25lbnVtAAAAD0VTbGljZVZlcnRBbGlnbgAAAAdkZWZhdWx0AAAAC2JnQ29sb3JUeXBlZW51bQAAABFFU2xpY2VCR0NvbG9yVHlwZQAAAABOb25lAAAACXRvcE91dHNldGxvbmcAAAAAAAAACmxlZnRPdXRzZXRsb25nAAAAAAAAAAxib3R0b21PdXRzZXRsb25nAAAAAAAAAAtyaWdodE91dHNldGxvbmcAAAAAADhCSU0EKAAAAAAADAAAAAI/8AAAAAAAADhCSU0EEQAAAAAAAQEAOEJJTQQUAAAAAAAEAAAAAThCSU0EDAAAAAAGcQAAAAEAAACAAAAAgAAAAYAAAMAAAAAGVQAYAAH/2P/tAAxBZG9iZV9DTQAC/+4ADkFkb2JlAGSAAAAAAf/bAIQADAgICAkIDAkJDBELCgsRFQ8MDA8VGBMTFRMTGBEMDAwMDAwRDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAENCwsNDg0QDg4QFA4ODhQUDg4ODhQRDAwMDAwREQwMDAwMDBEMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8AAEQgAgACAAwEiAAIRAQMRAf/dAAQACP/EAT8AAAEFAQEBAQEBAAAAAAAAAAMAAQIEBQYHCAkKCwEAAQUBAQEBAQEAAAAAAAAAAQACAwQFBgcICQoLEAABBAEDAgQCBQcGCAUDDDMBAAIRAwQhEjEFQVFhEyJxgTIGFJGhsUIjJBVSwWIzNHKC0UMHJZJT8OHxY3M1FqKygyZEk1RkRcKjdDYX0lXiZfKzhMPTdePzRieUpIW0lcTU5PSltcXV5fVWZnaGlqa2xtbm9jdHV2d3h5ent8fX5/cRAAICAQIEBAMEBQYHBwYFNQEAAhEDITESBEFRYXEiEwUygZEUobFCI8FS0fAzJGLhcoKSQ1MVY3M08SUGFqKygwcmNcLSRJNUoxdkRVU2dGXi8rOEw9N14/NGlKSFtJXE1OT0pbXF1eX1VmZ2hpamtsbW5vYnN0dXZ3eHl6e3x//aAAwDAQACEQMRAD8A9VSSSSUpJM5zWgucYA5JVG/Nc/21+1vj3P8A5FJTatyaqtHGXfujUqq/PsP0AGjxOpVZJJTN19zvpPd98fkUJJ5JKSSSlSexIU233N+i8/fP5VBJJTZZn2D6YDh4jQq1Vk1W6NMO/dOhWYkkp2ElQozXM9tnub49x/5JXmua4BzTIPBCSl0kkklP/9D1VM5wa0ucYA1JTqhm373ek36LfpeZ/wDMUlI8jIdc7wYPot/78UJJJJSkkkklKSSThj3fRaT8AUlLJJyx7fpNI+IKZJSkkkklKRcfIdS7xYfpN/i1CSSU67XBzQ5pkHUFOqGFfsd6Tvou+j5H/wAyV9JT/9H1DJt9KouH0jo34lZis575sazs0SfiVWSUpJJJJSlOml9zobwOXHgKLGOe8Mby4wFqVVtqYGN4H4lJTCrFqr1jc794oySSSlINuLVZrG137wRkklOVdS+l213B4cOCoLVtrbawsdwfwKy3scx5Y7lpgpKWSSSSUpaeNb6tQcfpDR3xCzFZwHxYWdnCR8Qkp//S9Avduue7zP4aKCR1JPiUklKSSSSU2sBkvc/90QPmryqdP+g/4j8itpKUkkkkpSSSSSlKjnsh7X/vCD8leVTqH0GfE/kSU0kkkklKU6HbbmO8x+OigkOQfApKf//T708keBSU727bnt8z+OqgkpSSSSSmzgPixzD+cJHxCvrIa4tcHN0IMhadNzbmBzfmPApKSJJJJKUkkkkpSoZ75sawfmiT8Srd1zaWFzvkPErMc4ucXO1LjJSUskkkkpSQ5A8Skp0N3XMb5j8NUlP/1PRs9kWB/Zwg/EKstPJq9WotH0hq34hZiSlJJJJKUpV2PqduYYPcdj8VEamBqfAKYpuPFbvuSU3as2p+j/Y7z4+9HBBEgyPJZfoX/wCjd9yXoXjitw+SSnUJA1JgeaBbm1M0Z73eXH3ql6F55rcfiEvQv/0bvuSUtZY+1255k9h2CipGm4c1u+5R4MHQ+CSlJJJJKUrOAybHP7NED4lVlp41XpVBp+kdXfEpKf/V9VVDNo2O9Vo9rvpeR/8AMlfTOaHNLXCQdCElOQrGPiGwB7/azsO5TWUCi1psBdTPP8HLQa5rmhzTIPBCSlmVsrEMaGjyUkkklKSSSSUpJJJJSlB9Vdgh7QVNJJTnZGIavez3M7+IQFruLWtJcQGjmVn1Y4vtJZIpB5P/AFISUywqN7vVd9Fv0fM/+Yq+ma0NaGtEAaAJ0lP/1vVUkkklLOa1zS1wkHkFVDTdjEuo99Z5YVcSSUhpyqrdJ2u/dPKMhW41NurhDv3hoUL0cur+asD2/uuSU2klV+1Xt/nKD8W6p/t9Xdrh8klNlJVvt9XZrj8k32q9383Qfi7RJTaQbsqqrSdzv3Ryh+jl2/ztgY391qLVjU1atEu/eOpSUhFN2SQ6/wBlY4YFaa1rQGtEAcAJ0klKSSSSU//ZADhCSU0EIQAAAAAAVwAAAAEBAAAADwBBAGQAbwBiAGUAIABQAGgAbwB0AG8AcwBoAG8AcAAAABQAQQBkAG8AYgBlACAAUABoAG8AdABvAHMAaABvAHAAIAAyADAAMgA0AAAAAQA4QklNBAYAAAAAAAcACAAAAAEBAP/hEYtodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAyIDc5LmYzNTRlZmM3MCwgMjAyMy8xMS8wOS0xMjowNTo1MyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE1IChNYWNpbnRvc2gpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxOC0xMS0xOVQxMDoyMTozNy0wODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDQtMjJUMDY6MjY6MjkrMDQ6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDQtMjJUMDY6MjY6MjkrMDQ6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyIgcGhvdG9zaG9wOkxlZ2FjeUlQVENEaWdlc3Q9Ijc5NDQyNERGN0RCNjlDRkFBRkY1QTUxMEIzMUYxMEI1IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjU0OWFjZGRiLWM4MTAtNDNhMC04OTAxLTllOWYzYmVhODU4YSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmY5ZDg3YjM1LTJkMjAtMTE3Yy1iN2VkLWI2ZjMyM2M4N2EzNSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmEyNWFhZjUwLWM3NWMtNDRjMC1iYjAwLTE3MDJhYjNhMjEyMiI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YTI1YWFmNTAtYzc1Yy00NGMwLWJiMDAtMTcwMmFiM2EyMTIyIiBzdEV2dDp3aGVuPSIyMDE4LTExLTE5VDEwOjIxOjM3LTA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoTWFjaW50b3NoKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YjUwYzJiOWQtMjBjZS00MDdkLTkxNzEtYzU5NzlkNTYyYjUwIiBzdEV2dDp3aGVuPSIyMDE4LTExLTIwVDE2OjQ0OjIzLTA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGltYWdlL3BuZyB0byBpbWFnZS9qcGVnIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBpbWFnZS9wbmcgdG8gaW1hZ2UvanBlZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NzhmOTg1YmMtOTk4NS00M2M1LWE5MmYtNTQ4ZGIyOGVmYjMzIiBzdEV2dDp3aGVuPSIyMDE4LTExLTIwVDE2OjQ0OjIzLTA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTQ5YWNkZGItYzgxMC00M2EwLTg5MDEtOWU5ZjNiZWE4NThhIiBzdEV2dDp3aGVuPSIyMDI0LTA0LTIyVDA2OjI2OjI5KzA0OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuNSAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YjUwYzJiOWQtMjBjZS00MDdkLTkxNzEtYzU5NzlkNTYyYjUwIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOmEyNWFhZjUwLWM3NWMtNDRjMC1iYjAwLTE3MDJhYjNhMjEyMiIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmEyNWFhZjUwLWM3NWMtNDRjMC1iYjAwLTE3MDJhYjNhMjEyMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8P3hwYWNrZXQgZW5kPSJ3Ij8+/+4ADkFkb2JlAGRAAAAAAf/bAIQAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQICAgICAgICAgICAwMDAwMDAwMDAwEBAQEBAQEBAQEBAgIBAgIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD/8AAEQgAgACAAwERAAIRAQMRAf/dAAQAEP/EAaIAAAAGAgMBAAAAAAAAAAAAAAcIBgUECQMKAgEACwEAAAYDAQEBAAAAAAAAAAAABgUEAwcCCAEJAAoLEAACAQMEAQMDAgMDAwIGCXUBAgMEEQUSBiEHEyIACDEUQTIjFQlRQhZhJDMXUnGBGGKRJUOhsfAmNHIKGcHRNSfhUzaC8ZKiRFRzRUY3R2MoVVZXGrLC0uLyZIN0k4Rlo7PD0+MpOGbzdSo5OkhJSlhZWmdoaWp2d3h5eoWGh4iJipSVlpeYmZqkpaanqKmqtLW2t7i5usTFxsfIycrU1dbX2Nna5OXm5+jp6vT19vf4+foRAAIBAwIEBAMFBAQEBgYFbQECAxEEIRIFMQYAIhNBUQcyYRRxCEKBI5EVUqFiFjMJsSTB0UNy8BfhgjQlklMYY0TxorImNRlUNkVkJwpzg5NGdMLS4vJVZXVWN4SFo7PD0+PzKRqUpLTE1OT0laW1xdXl9ShHV2Y4doaWprbG1ub2Z3eHl6e3x9fn90hYaHiImKi4yNjo+DlJWWl5iZmpucnZ6fkqOkpaanqKmqq6ytrq+v/aAAwDAQACEQMRAD8A3+Pfuvde9+691737r3XvfuvdITdHY+1Npl4MhX/c5FRcYrHKKuvueB5URhFSgn8zOnH0v7917oCs33tuOsLx4LHUOFgNtE9XfJ11vobp+zRRE/W2mW39T7917oNa/em8MoX++3PmpVc6jFDVtQwA8/phoBTIByf6+/de6TrzTym81RUzn8mepnnJv9bmaRz+ffuvddJLPGdUVRUwt/qoKmeBuPp6opEPv3XulHQb13hjCpodz5mJUNxFNWNWwE/4w14qUI/2A9+690JWF733HRlUzuNoc1ACdc1H/uMrrHgWQ+ailI+trRX/AKj37r3Q67X7H2puwrBj6/7bIlbnFZFRSV/9D4kdjFVi/wCYXfj629+690u/fuvde9+691737r3Xvfuvdf/Q3+Pfuvde9+691Er6+jxdHUZDIVMNHRUkTTVNTUOI4oY1+rOx/qTYD6kkAXJ9+690VXfHcuUzTTY7a7T4fEeqOTI28WXyABsWgJ5xlMwHFv32H1KXt7917oEwACx5LMxZ2Ylnd2N2eR2JZ3Y/Ukkn37r3Xfv3Xuve/de697917r3v3Xuve/de697917rogEqeQyMHRlJV43XlXjdSGR1P0III9+690Nux+5MphWhxu6GnzGIGmOPIgGXL49SeGnP1ydMgPN/31HN3tb37r3RqaGvo8nR0+Qx9TDWUVXEs1NU07iSGaNvoyOvHBFiPqCCDyPfuvdS/fuvde9+691//0d/j37r3USvrqPGUdTkMhURUlFRwvUVNTM2mOGGMandjyTx9ALkngAn37r3RKewN/wBdviv0r5aTb1HKWxmMY6WnZbquSyKg2erkXmOM3WnU2F3LN7917pAe/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de6X/X+/6/Y9fpbzVm3qyYNk8Yp1NAzWVsljUJASrQcyRghZ1FjZwre/de6OtQV1Hk6OmyGPqIquirIUqKaphbVHNDINSOp4I4+oNiDwQD7917qX7917r//S3+PfuvdFL7l3u2ayb7Vx03+4jDzj+JvGxC5DLxc/bsR+ulxbfUfRqi97+Me/de6BP37r3Xvfuvde9+691737r3XFmVBd2VR9LsQoufoLmw59+69050mHzOQXVQYXMVqfh6bGVssZ/ppkWDQwP+B9+6916sw+Zx666/DZeiQfV6rGVsMY/wAWkaAIo/1z7917psVlYXVlYf1Ugj/bjj37r3XL37r3Xvfuvde9+691737r3Q2dNb3bC5RdrZGb/cRmJz/DHkY6cdlpST9ul76KbKNwB9FqLW/zh9+690bT37r3X//T3vuxt0HaW1a/IwsBkKjTjsUD/wA7CsDJHLbm60kYeY/1Edvz7917ojABA5ZmYkszsdTu7Es8jseWd3JJP1JPv3Xuu/fuvde9+691737r3Sq2js7M70yDUWKjWOnp9ByOUqFb7PHo/Kq2mzVFXKvMcKkMR6mKrz7917o2O1urtp7YSOVKFMrk1A15XKJHU1GuwuaaFlNNRJqFwI1DD8sfr7917oRQAAABYDgAcAAfQAe/de68QCCCLg8EHkEH6gj37r3Qc7p6u2puhJZXokxWUYHx5XFpHTVGuxsamFVFNWpqPIkUsfww+vv3Xuinbu2dmdl5BaHKxrJBUa2x2Upw32eQROWVdV2p6uJf85CxLAepSy8+/de6S3v3Xuve/de697917ro3t6WZGBDK6HS6OpDJIjDlXjcAg/gi/v3Xujz9c7oO7dqUGRmYHI0+rHZUDj/chSBUklt+Fq4ysw/FpLfj37r3X//U3SO982azcWNwMbnwYWh+9nT8GvydwhP9TDRQi1/p5T7917oD/fuvde9+691737r3ThicVWZzKY/DY9Q1bk6lKaAsCUiBBeapm0gkQ0sCNI/+C2+p9+690fLbW3cdtXDUmFxkemCmS8kzAeesqnsaitqWH+cqKh+SfwLKLKAB7r3T97917r3v3Xuve/de697917ph3Lt3Hbpw1XhcnHqgqUvFMoHno6pLmnraVz/m6infkH8i6m6kg+690Q3LYusweUyGGyCha3GVL005UERygAPDUw3APhqoHWRP8Gt9R7917pv9+691737r3XvfuvdDj0RmzR7iyWBkY+DM0P3kC/gV2MID2ueDNRTG9vr4h7917r//1dv7etecpvDc9drLrLmauGIn6iChYUEK/wCsEpf959+690mffuvde9+691737r3Q8dCYhKnN5vNyKrfwuip6ClJ+sdRkXeWodf8AahTUqrf8Bz/X37r3RqPfuvde9+691737r3Xvfuvde9+691737r3RV++8QlNm8JnI1Vf4pRT0FUR9ZKjHOktO7f4/b1TLf8hB/T37r3QD+/de697917r3v3XulNsqvOL3htiu1FFizNJDKR9TBXMaCZf9YpVf7x7917r/1ttuVzLPUSty09TUzsb3u088kpN/zcv7917rh7917r3v3Xuve/de6M58fSv8K3OONYzFIT9L6DjotF/zbUG9+690YT37r3Xvfuvde9+691737r3Xvfuvde9+690Xz5BFf4VtgG3k/jFWV/roGOmD/wCNtTL7917osXv3Xuve/de697917rJC5jnp5QbGGppp1P8ARoJ45lP4/Ke/de6//9fbcmQxz1MRFjDU1MDD+jQTyRMP9unv3Xusfv3Xuve/de697917ocOiMylHuLKYSVwq5qhjqaYceusxbSGSO/8Aqno6hmH+EZ9+690bD37r3Xvfuvde9+691737r3Xvfuvde9+690U/vfNJW7jxeEiYMuFoJKmpA/sVmUaMxpf/AFSUdOrH+gkHv3XugP8Afuvde9+691737r3WSFDJPTxAXM1TTQKP6tPPHCo/P5f37r3X/9Db+3rQHF7x3PQlSix5mrmhB+pgrmFfC3+IKVPH+t7917pM+/de697917r3v3XupVBXVeLr6LJ0EvgrsfUxVdJKRqVZojcLIv8AailUlHH5RiPfuvdHs2duzHbywsGVoWCS2EOQoWYNPjq5VBmppbfVQTeN7WkjIYfWw917pVe/de697917r3v3Xuve/de6Su8d247ZuFnyteweSxhx9CrAT5CuZSYaaEH6KSLyP9I4wWP0sfde6InXV1XlK6tyeQl81dkamWsq5ALKZpmuVjX+zDEoCIP7KKB+PfuvdRffuvde9+691737r3Sm2VQHKbw2xQ6S6y5mkmlA+ogoWNfMx/oAlKffuvdf/9HdJ73wjUe4sbno1tBmqH7OdvwK/GElAbfQzUUwtf6+I+/de6A737r3Xvfuvde9+691737r3T5t3cmY2pklyuFqRBPZY6mCVTJR5CBW1fb1sAZPInJ0uCJIybqRyD7r3RpNsdz7WzSRQZeT+7mTbSrRV7g4+WQ8XpckAsOknm0oiYf0P19+690LNPVUtZGJqSpgqomAIlp5o54yD9CHiZlIP+v7917rqoq6WjjM1XU09LEou0tRNHBGAPqS8rKoA/1/fuvdBPufufa2FSWDESjceTXUixUD2x8Ug4vVZIq0OhTzaLysf6D6+/de6K3uLcmY3VknymaqfPPZo6aCMGOjx9OzBvtqKEs3jS4GpyTJIRdieAPde6Y/fuvde9+691737r3XvfuvdDh0RhDWbjyWekS8GFofs4H/AOm/JkFwP6mKihN/8JR7917r/9Le+7G2ud27Ur8dAoORp9ORxRPH+5CjDPHESPotXEzwn+gkv+PfuvdEYF7cqyMCVZHGl0dSVeN1PKujghh+CLe/de679+691737r3XcaPPKIIIpqidrWgpoZaic3+hEMKSSW/xt7917pQx7O3hMgki2puJ0b6MMVUqD/rB0Rv8AePfuvdZP7k70/wCeQ3F/57Jv+Ke/de69Hsne0X+Z2puaD/lhQ1UH+x/aZOffuvdek2Tvab/P7U3NPze9RQ1U5v8A1BmZ7H37r3Xv7k70/wCeQ3F/57Jv+Ke/de6xy7P3fAhkm2puKNB9XOKq2A/1xHG7f7x7917pOuGikMMySQzrfVBPG8Ey2+paGVUkA/2Hv3Xuve/de697917rokgcKzsSFVEGp3diFSNF+rO7EAD8k+/de6PP1ztc7S2pQY6dQMjUasjlSOf9yFYFeSK/5WkiCQj8ER3/AD7917r/09/j37r3RS+5dkNhco26cdD/ALiMxOP4mkanTj8vKbfcMBwlNlG5J+i1F728g9+690Cf05PAHJJ4AA5JJPAAHv3Xuhm696lqdzxQZrPtUY7AyASUdLEfDkMvGeVmLka6HHv9VNvLKvK6VIY+690aLD7fwm36daXC4uixsIXSRTQqkknN7zTEGadifqzsxP8AX37r3Tx7917r3v3Xuve/de697917r3v3Xuve/de6Y83tvBbjpzTZvF0mQjIsrTRDzxH8NBUppqIHB+hRlPv3Xuirdh9VVm0Uky+Iknye3V5qPKA9fhwTYNUsoH3dDyP3rB4/7YI9fv3Xugk9+690NnTWyGzWUTdWRh/3EYac/wAMSRTpyGXj4+4UH9dNi25B+jVFrX8Z9+690bT37r3X/9Tf49+691Er6GjydHU4/IU8VXRVkL09VTTLqimhkGl0YfXkfQixB5Fj7917ooOf2LSdf7qxdTuCnrctsOXIK6VcCrLKo9TwY3LJb1mCUKWtb7uFSF9epPfuvdG9x9dQ5Kipa7G1EFXQVMKyUtRTOrwSREWUxleAFtYjgqRYgEW9+691M9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3UHJVePocfWVeVmpqfGwU8jVstWUFMtOV0yCYSXVkcNp02Oom1iTb37r3RP9s7Cpd97myUuBirsfsKnyDn76pXxVDQXDtisaGu3kZyQrNc00BXX+5ZffuvdHDoKGjxlHTY/H08VJRUcKU9NTQrpjhhjGlEUck8fUm5J5JJ9+691L9+691//V3+Pfuvde9+691Er6CiylHUY/I00NZRVcTQ1NNUIJIZo2+qsrf0IBB+oIBFiPfuvdAJU7S3l1hVz5XYTy5/bMztPX7Vq3eWogvYM9Ja8s7KPpJH+/YWdJQL+/de6EDaXaO1t2aKaOq/hWYuUlw2UZKerWZdIeOndiIqvSxtZT5Bb1Iv09+690I3v3Xuve/de697917r3v3Xuve/de697917oOd3dobX2mGppKn+K5i4SLDYxlqKoytcIlQ66oqTUwtZj5Df0o309+690H9LtPeXZ9XBld+vLgNswuJ8ftakd4aie3CPWBrSQMw+skg89jZEhBv7917oe6Cgo8XR0+Px9NDR0VJEsNNTU6COKGNfoqKP6k3J+pJJNyffuvdS/fuvde9+691//W3+Pfuvde9+691737r3XvfuvdILdXW2093apsjjxT5EgacrjyKSvDLyrSuqmOq0n/AI6q9vxb37r3SDTaHa+0bLtXdlNuTGx6Vjxe4ltOsYudEc8rOAB9PTNEP8B7917rMOzN9YkMu5esctZG0tVYSVqunP15VVjqU5t/x19+691mTvXbSj/LcJuqhkt6kmxcXpPNxdquMm1vrb37r3Xn7220wtRYTdVdJb0xxYuH1E/QXWrkIv8A1t7917rCezN9ZYKu2usctZ2KrV5uRqSnH+LKY6ZOL/8AHX37r3WFtodr7uGndW66bbeNk1LLi9vLed0POiSeJowQfp6ppR/h7917pe7V622ntHTNjceJ8gAdWVyDCrrixsWaN2URU2o/8clT6839+690vPfuvde9+691737r3Xvfuvdf/9k=';

//store only if there isnt a chat
export const setData = ({ chatId, value }: SetDataType): void => {
  localStorage.setItem(chatId, JSON.stringify(value));
};

//add return type
export const getData = (key: string): IFeeds | null => {
  const chatJson = localStorage.getItem(key);
  const chat = chatJson ? JSON.parse(chatJson) : null;
  return chat;
};

export const getPfp = async ({ user, recipient }: { user: PushAPI | undefined; recipient: string }) => {
  const fetchData = async () => {
    try {
      const response = await user?.profile.info({
        overrideAccount: recipient,
      });

      const pfp = response.picture ? response.picture : defaultPfp;
      setPfp({ account: recipient, image: pfp });
      return pfp;
    } catch (err: Error | any) {
      console.error(`UIWeb::helpers::getPfp::Error: ${err}`);
      return defaultPfp;
    }
  };

  const pfp = user?.account ? getCacheData(recipient, 1000 * 60 * 60 * 24) : defaultPfp;

  if (pfp === null) {
    return fetchData();
  } else {
    return pfp;
  }
};

export const setPfp = ({ account, image }: { account: string; image: string }) => {
  const timeBasedCache = {
    value: image,
    timestamp: new Date().getTime(),
  };

  localStorage.setItem(account, JSON.stringify(timeBasedCache));
};

// Function to get data, checking if it's still valid based on the timestamp
export const getCacheData = (key: string, expiry: number): any | null => {
  const dataStr = localStorage.getItem(key);
  if (!dataStr) return null;

  const data = JSON.parse(dataStr);
  const now = new Date().getTime();

  if (now > data.timestamp + expiry) {
    localStorage.removeItem(key); // Invalidate the cache
    return null;
  }

  return data.value;
};

export const setAccessControl = (chatId: string, toRemove: boolean) => {
  if (toRemove) {
    localStorage.removeItem(chatId);
  } else {
    const timestamp = new Date().getTime();
    localStorage.setItem(chatId, JSON.stringify(timestamp));
  }
};

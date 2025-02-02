// src/components/admin/users/edit-user-dialog.tsx -->

"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from '../../../../components/ui/dialog';
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from '../../../../components/ui/form';
import { Input } from '@/components/ui/input';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '../../../../components/ui/select';

const userSchema = z.object({
 email: z.string().email('Invalid email address'),
 firstName: z.string().min(1, 'First name is required'),
 lastName: z.string().min(1, 'Last name is required'),
 role: z.enum(['admin', 'user', 'manager']),
 status: z.enum(['active', 'inactive', 'suspended']),
 department: z.string().optional(),
 phone: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface EditUserDialogProps {
 user: any;
 open: boolean;
 onClose: () => void;
}

export function EditUserDialog({
 user,
 open,
 onClose,
}: EditUserDialogProps) {
 const queryClient = useQueryClient();
 const { toast } = useToast();

 const form = useForm<UserFormData>({
   resolver: zodResolver(userSchema),
   defaultValues: {
     email: user.email,
     firstName: user.firstName,
     lastName: user.lastName,
     role: user.role,
     status: user.status,
     department: user.department || '',
     phone: user.phone || '',
   },
 });

 const { mutate: updateUser, isPending } = useMutation({
   mutationFn: async (data: UserFormData) => {
     const { error } = await supabase
       .from('users')
       .update(data)
       .eq('id', user.id);
     if (error) throw error;
   },
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['users'] });
     toast.success('User updated successfully');
     onClose();
   },
   onError: () => {
     toast.error('Failed to update user');
   },
 });

 return (
   <Dialog open={open} onOpenChange={onClose}>
     <DialogContent className="sm:max-w-[600px]">
       <DialogHeader>
         <DialogTitle>Edit User</DialogTitle>
       </DialogHeader>

       <Form {...form}>
         <form onSubmit={form.handleSubmit((data) => updateUser(data))} className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
             <FormField
               control={form.control}
               name="firstName"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>First Name</FormLabel>
                   <FormControl>
                     <Input {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />

             <FormField
               control={form.control}
               name="lastName"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Last Name</FormLabel>
                   <FormControl>
                     <Input {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
           </div>

           <FormField
             control={form.control}
             name="email"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Email</FormLabel>
                 <FormControl>
                   <Input type="email" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />

           <div className="grid grid-cols-2 gap-4">
             <FormField
               control={form.control}
               name="role"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Role</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select role" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       <SelectItem value="admin">Admin</SelectItem>
                       <SelectItem value="manager">Manager</SelectItem>
                       <SelectItem value="user">User</SelectItem>
                     </SelectContent>
                   </Select>
                   <FormMessage />
                 </FormItem>
               )}
             />

             <FormField
               control={form.control}
               name="status"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Status</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select status" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       <SelectItem value="active">Active</SelectItem>
                       <SelectItem value="inactive">Inactive</SelectItem>
                       <SelectItem value="suspended">Suspended</SelectItem>
                     </SelectContent>
                   </Select>
                   <FormMessage />
                 </FormItem>
               )}
             />
           </div>

           <FormField
             control={form.control}
             name="department"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Department (Optional)</FormLabel>
                 <FormControl>
                   <Input {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />

           <FormField
             control={form.control}
             name="phone"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Phone (Optional)</FormLabel>
                 <FormControl>
                   <Input {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />

           <div className="flex justify-end space-x-4">
             <Button
               type="button"
               variant="outline"
               onClick={onClose}
               disabled={isPending}
             >
               Cancel
             </Button>
             <Button type="submit" disabled={isPending}>
               Save Changes
             </Button>
           </div>
         </form>
       </Form>
     </DialogContent>
   </Dialog>
 );
}
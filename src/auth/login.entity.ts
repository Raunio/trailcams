import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Login {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column()
    password: string;
}

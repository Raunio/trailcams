import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column()
    password: string;

    @Column({ unique: true })
    default_bucket: string;

    @Column({ unique: true })
    iam_username: string;
}

import { Login } from 'src/auth/login.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserGroup } from './user.group.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @JoinColumn({ name: 'login_id', referencedColumnName: 'id' })
    @OneToOne(() => Login)
    login: Login;

    @Column()
    login_id: string;

    @Column({ unique: true })
    default_bucket: string;

    @Column({ unique: true })
    iam_username: string;

    @ManyToOne(() => UserGroup)
    @JoinColumn({ name: 'group_id', referencedColumnName: 'id' })
    group: UserGroup;

    @Column()
    group_id: string;
}

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Institute',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('wallet_address', models.CharField(blank=True, max_length=42, null=True, unique=True)),
                ('email', models.EmailField(unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='auth.user')),
            ],
        ),
        migrations.CreateModel(
            name='Student',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('email', models.EmailField()),
                ('roll_number', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('institute', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='students', to='certificates.institute')),
            ],
        ),
        migrations.CreateModel(
            name='Certificate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('course', models.CharField(max_length=200)),
                ('grade', models.CharField(max_length=100)),
                ('issue_date', models.DateField()),
                ('cert_hash', models.CharField(max_length=66, unique=True)),
                ('tx_hash', models.CharField(blank=True, max_length=66)),
                ('ipfs_cid', models.CharField(blank=True, max_length=100)),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('REVOKED', 'Revoked')], default='ACTIVE', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('revoked_at', models.DateTimeField(blank=True, null=True)),
                ('institute', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='certificates', to='certificates.institute')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='certificates', to='certificates.student')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AlterUniqueTogether(
            name='student',
            unique_together={('institute', 'roll_number')},
        ),
    ]
